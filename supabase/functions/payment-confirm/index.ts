import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createSupabaseClient, getUserFromAuthHeader } from '../_shared/supabase.ts'

interface PaymentConfirmRequest {
  paymentKey: string
  orderId: string
  amount: number
  provider: 'toss' | 'inicis' | 'kakao'
}

interface TossPaymentResponse {
  paymentKey: string
  orderId: string
  status: string
  totalAmount: number
  approvedAt: string
  method: string
  receipt: {
    url: string
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createSupabaseClient()
    const user = await getUserFromAuthHeader(req.headers.get('authorization'))
    
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { paymentKey, orderId, amount, provider }: PaymentConfirmRequest = await req.json()

    // Validate required fields
    if (!paymentKey || !orderId || !amount || !provider) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let paymentResult: any

    // Process payment confirmation based on provider
    switch (provider) {
      case 'toss':
        paymentResult = await confirmTossPayment(paymentKey, orderId, amount)
        break
      case 'inicis':
        paymentResult = await confirmInicisPayment(paymentKey, orderId, amount)
        break
      case 'kakao':
        paymentResult = await confirmKakaoPayment(paymentKey, orderId, amount)
        break
      default:
        throw new Error(`Unsupported payment provider: ${provider}`)
    }

    if (!paymentResult.success) {
      return new Response(
        JSON.stringify({ success: false, error: paymentResult.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Save payment record to database
    const { data: paymentRecord, error: paymentError } = await supabase
      .from('payments')
      .insert([
        {
          user_id: user.id,
          payment_key: paymentKey,
          order_id: orderId,
          amount: amount,
          provider: provider,
          status: 'completed',
          payment_data: paymentResult.data,
          created_at: new Date().toISOString(),
        }
      ])
      .select()
      .single()

    if (paymentError) {
      throw new Error(`Failed to save payment record: ${paymentError.message}`)
    }

    // Update related order/review request status
    await updateOrderStatus(supabase, orderId, 'paid')

    // Send confirmation notification
    await sendPaymentConfirmationNotification(supabase, user.id, paymentRecord)

    return new Response(
      JSON.stringify({
        success: true,
        payment: paymentRecord,
        receipt: paymentResult.data.receipt
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Payment confirmation error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function confirmTossPayment(paymentKey: string, orderId: string, amount: number) {
  const tossSecretKey = Deno.env.get('TOSS_SECRET_KEY')
  
  if (!tossSecretKey) {
    throw new Error('Toss secret key not configured')
  }

  const basicAuth = btoa(`${tossSecretKey}:`)
  
  const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basicAuth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      paymentKey,
      orderId,
      amount,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    return {
      success: false,
      error: data.message || 'Payment confirmation failed'
    }
  }

  return {
    success: true,
    data: data as TossPaymentResponse
  }
}

async function confirmInicisPayment(paymentKey: string, orderId: string, amount: number) {
  // Implement KG Inicis payment confirmation
  // This would involve calling Inicis API with merchant credentials
  const inicisKey = Deno.env.get('INICIS_API_KEY')
  
  if (!inicisKey) {
    throw new Error('Inicis API key not configured')
  }

  // TODO: Implement actual Inicis API call
  // For now, return mock success
  return {
    success: true,
    data: {
      paymentKey,
      orderId,
      status: 'DONE',
      totalAmount: amount,
      approvedAt: new Date().toISOString(),
      method: 'CARD',
      receipt: {
        url: `https://inicis.com/receipt/${paymentKey}`
      }
    }
  }
}

async function confirmKakaoPayment(paymentKey: string, orderId: string, amount: number) {
  // Implement Kakao Pay confirmation
  const kakaoAdminKey = Deno.env.get('KAKAO_ADMIN_KEY')
  
  if (!kakaoAdminKey) {
    throw new Error('Kakao admin key not configured')
  }

  // TODO: Implement actual Kakao Pay API call
  // For now, return mock success
  return {
    success: true,
    data: {
      paymentKey,
      orderId,
      status: 'SUCCESS_PAYMENT',
      totalAmount: amount,
      approvedAt: new Date().toISOString(),
      method: 'MONEY',
      receipt: {
        url: `https://pay.kakao.com/receipt/${paymentKey}`
      }
    }
  }
}

async function updateOrderStatus(supabase: any, orderId: string, status: string) {
  // Update review request status if this is a review payment
  const { data: reviewRequest } = await supabase
    .from('review_requests')
    .select('id')
    .eq('order_id', orderId)
    .single()

  if (reviewRequest) {
    await supabase
      .from('review_requests')
      .update({ payment_status: status })
      .eq('id', reviewRequest.id)
  }
}

async function sendPaymentConfirmationNotification(supabase: any, userId: string, payment: any) {
  await supabase.rpc('create_notification', {
    p_user_id: userId,
    p_type: 'payment_completed',
    p_title: '결제가 완료되었습니다',
    p_message: `${payment.amount.toLocaleString()}원 결제가 성공적으로 처리되었습니다.`,
    p_data: {
      payment_id: payment.id,
      order_id: payment.order_id,
      amount: payment.amount
    }
  })
}