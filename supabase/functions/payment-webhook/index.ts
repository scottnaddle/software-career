import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createSupabaseClient } from '../_shared/supabase.ts'
import { crypto } from 'https://deno.land/std@0.168.0/crypto/mod.ts'

interface WebhookPayload {
  provider: 'toss' | 'inicis' | 'kakao'
  eventType: string
  orderId: string
  paymentKey?: string
  status: string
  amount: number
  data: any
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const supabase = createSupabaseClient()
    const body = await req.text()
    
    // Determine provider from URL path or headers
    const url = new URL(req.url)
    const provider = url.pathname.split('/').pop() as 'toss' | 'inicis' | 'kakao'
    
    if (!provider || !['toss', 'inicis', 'kakao'].includes(provider)) {
      return new Response(
        JSON.stringify({ error: 'Invalid provider' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify webhook signature
    const isValid = await verifyWebhookSignature(req, body, provider)
    if (!isValid) {
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse webhook data based on provider
    const webhookData = parseWebhookData(body, provider)
    
    // Process the webhook
    const result = await processWebhook(supabase, webhookData)

    return new Response(
      JSON.stringify({ success: true, result }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Webhook processing error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function verifyWebhookSignature(req: Request, body: string, provider: string): Promise<boolean> {
  switch (provider) {
    case 'toss':
      return verifyTossSignature(req, body)
    case 'inicis':
      return verifyInicisSignature(req, body)
    case 'kakao':
      return verifyKakaoSignature(req, body)
    default:
      return false
  }
}

async function verifyTossSignature(req: Request, body: string): Promise<boolean> {
  const signature = req.headers.get('toss-signature')
  const webhookSecret = Deno.env.get('TOSS_WEBHOOK_SECRET')
  
  if (!signature || !webhookSecret) {
    return false
  }

  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(webhookSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signatureBytes = await crypto.subtle.sign('HMAC', key, encoder.encode(body))
  const expectedSignature = btoa(String.fromCharCode(...new Uint8Array(signatureBytes)))

  return signature === expectedSignature
}

async function verifyInicisSignature(req: Request, body: string): Promise<boolean> {
  // KG Inicis signature verification
  const signature = req.headers.get('inicis-signature')
  const webhookSecret = Deno.env.get('INICIS_WEBHOOK_SECRET')
  
  if (!signature || !webhookSecret) {
    return false
  }

  // Implement Inicis-specific signature verification
  // This would depend on Inicis webhook documentation
  return true // Placeholder
}

async function verifyKakaoSignature(req: Request, body: string): Promise<boolean> {
  // Kakao Pay signature verification
  const signature = req.headers.get('kakao-signature')
  const webhookSecret = Deno.env.get('KAKAO_WEBHOOK_SECRET')
  
  if (!signature || !webhookSecret) {
    return false
  }

  // Implement Kakao-specific signature verification
  // This would depend on Kakao Pay webhook documentation
  return true // Placeholder
}

function parseWebhookData(body: string, provider: string): WebhookPayload {
  const data = JSON.parse(body)
  
  switch (provider) {
    case 'toss':
      return {
        provider: 'toss',
        eventType: data.eventType,
        orderId: data.data.orderId,
        paymentKey: data.data.paymentKey,
        status: data.data.status,
        amount: data.data.totalAmount,
        data: data.data
      }
    case 'inicis':
      return {
        provider: 'inicis',
        eventType: data.eventType || 'payment_completed',
        orderId: data.orderId,
        paymentKey: data.paymentKey,
        status: data.status,
        amount: data.amount,
        data: data
      }
    case 'kakao':
      return {
        provider: 'kakao',
        eventType: data.eventType || 'payment_completed',
        orderId: data.partner_order_id,
        paymentKey: data.tid,
        status: data.status,
        amount: data.amount.total,
        data: data
      }
    default:
      throw new Error(`Unsupported provider: ${provider}`)
  }
}

async function processWebhook(supabase: any, webhook: WebhookPayload) {
  console.log(`Processing ${webhook.provider} webhook:`, webhook.eventType)

  switch (webhook.eventType) {
    case 'PAYMENT_COMPLETED':
    case 'payment_completed':
      return await handlePaymentCompleted(supabase, webhook)
    case 'PAYMENT_CANCELED':
    case 'payment_canceled':
      return await handlePaymentCanceled(supabase, webhook)
    case 'PAYMENT_FAILED':
    case 'payment_failed':
      return await handlePaymentFailed(supabase, webhook)
    default:
      console.log(`Unhandled event type: ${webhook.eventType}`)
      return { message: 'Event processed' }
  }
}

async function handlePaymentCompleted(supabase: any, webhook: WebhookPayload) {
  // Find the payment record
  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .select('*')
    .eq('order_id', webhook.orderId)
    .single()

  if (paymentError || !payment) {
    console.error('Payment not found:', webhook.orderId)
    return { error: 'Payment not found' }
  }

  // Update payment status
  const { error: updateError } = await supabase
    .from('payments')
    .update({
      status: 'completed',
      payment_key: webhook.paymentKey,
      payment_data: webhook.data,
      completed_at: new Date().toISOString()
    })
    .eq('id', payment.id)

  if (updateError) {
    console.error('Failed to update payment:', updateError)
    return { error: 'Failed to update payment' }
  }

  // Process post-payment actions
  await processPostPaymentActions(supabase, payment, webhook)

  return { message: 'Payment completed successfully' }
}

async function handlePaymentCanceled(supabase: any, webhook: WebhookPayload) {
  const { error } = await supabase
    .from('payments')
    .update({
      status: 'canceled',
      payment_data: webhook.data,
      updated_at: new Date().toISOString()
    })
    .eq('order_id', webhook.orderId)

  if (error) {
    console.error('Failed to update canceled payment:', error)
    return { error: 'Failed to update payment' }
  }

  return { message: 'Payment canceled' }
}

async function handlePaymentFailed(supabase: any, webhook: WebhookPayload) {
  const { error } = await supabase
    .from('payments')
    .update({
      status: 'failed',
      payment_data: webhook.data,
      updated_at: new Date().toISOString()
    })
    .eq('order_id', webhook.orderId)

  if (error) {
    console.error('Failed to update failed payment:', error)
    return { error: 'Failed to update payment' }
  }

  return { message: 'Payment failed' }
}

async function processPostPaymentActions(supabase: any, payment: any, webhook: WebhookPayload) {
  // If this is a verification payment, create review request
  if (payment.type === 'verification') {
    const { data: career } = await supabase
      .from('careers')
      .select('*')
      .eq('user_id', payment.user_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (career) {
      const reviewFee = payment.service_type === 'express' ? 100000 : 50000
      const priority = payment.service_type === 'express' ? 'high' : 'normal'

      const { data: reviewRequest, error: reviewError } = await supabase
        .from('review_requests')
        .insert([
          {
            career_id: career.id,
            user_id: payment.user_id,
            payment_id: payment.id,
            priority,
            review_fee: reviewFee,
            status: 'assigned',
            requested_at: new Date().toISOString(),
          }
        ])
        .select()
        .single()

      if (!reviewError) {
        // Update career status
        await supabase
          .from('careers')
          .update({ status: 'pending' })
          .eq('id', career.id)

        // Create notification
        await supabase.rpc('create_notification', {
          p_user_id: payment.user_id,
          p_type: 'review_requested',
          p_title: '경력 검토가 시작되었습니다',
          p_message: `${career.title} 경력의 검토가 시작되었습니다.`,
          p_data: {
            career_id: career.id,
            review_request_id: reviewRequest.id
          }
        })
      }
    }
  }

  // Send confirmation notification
  await supabase.rpc('create_notification', {
    p_user_id: payment.user_id,
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