import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createSupabaseClient, getUserFromAuthHeader } from '../_shared/supabase.ts'

interface CreateReviewRequest {
  careerId: string
  priority: 'normal' | 'high' | 'urgent'
  requestedSpecializations: string[]
  deadline?: string
  additionalNotes?: string
}

interface AcceptReviewRequest {
  reviewRequestId: string
  expertId: string
  estimatedCompletionTime: string
}

interface UpdateReviewStatus {
  reviewRequestId: string
  status: 'assigned' | 'in_progress' | 'completed' | 'cancelled'
  reviewResult?: any
  completionNotes?: string
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createSupabaseClient()
    const user = await getUserFromAuthHeader(req.headers.get('authorization'))
    
    const url = new URL(req.url)
    const pathname = url.pathname

    if (req.method === 'GET') {
      if (pathname.endsWith('/expert-requests')) {
        return await handleGetExpertRequests(req, supabase, user)
      } else if (pathname.endsWith('/user-requests')) {
        return await handleGetUserRequests(req, supabase, user)
      } else if (pathname.endsWith('/available')) {
        return await handleGetAvailableRequests(req, supabase, user)
      } else {
        return await handleGetReviewRequest(req, supabase, user)
      }
    } else if (req.method === 'POST') {
      if (pathname.endsWith('/create')) {
        return await handleCreateReviewRequest(req, supabase, user)
      } else if (pathname.endsWith('/accept')) {
        return await handleAcceptReviewRequest(req, supabase, user)
      } else if (pathname.endsWith('/assign')) {
        return await handleAssignReviewRequest(req, supabase, user)
      } else {
        return await handleCreateReviewRequest(req, supabase, user)
      }
    } else if (req.method === 'PUT') {
      return await handleUpdateReviewStatus(req, supabase, user)
    } else if (req.method === 'DELETE') {
      return await handleCancelReviewRequest(req, supabase, user)
    } else {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('Review management error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function handleCreateReviewRequest(req: Request, supabase: any, user: any) {
  const body: CreateReviewRequest = await req.json()
  
  const { careerId, priority, requestedSpecializations, deadline, additionalNotes } = body

  if (!careerId || !priority || !requestedSpecializations?.length) {
    return new Response(
      JSON.stringify({ error: 'Missing required fields' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Verify user owns the career
  const { data: career, error: careerError } = await supabase
    .from('careers')
    .select('*')
    .eq('id', careerId)
    .eq('user_id', user.id)
    .single()

  if (careerError || !career) {
    return new Response(
      JSON.stringify({ error: 'Career not found or access denied' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Calculate review fee based on priority
  const reviewFees = {
    normal: 50000,
    high: 75000,
    urgent: 100000
  }

  const orderId = `review_${Date.now()}_${user.id}`
  
  // Create review request
  const { data: reviewRequest, error: reviewError } = await supabase
    .from('review_requests')
    .insert([
      {
        user_id: user.id,
        career_id: careerId,
        order_id: orderId,
        priority: priority,
        requested_specializations: requestedSpecializations,
        review_fee: reviewFees[priority],
        deadline: deadline || null,
        additional_notes: additionalNotes || null,
        status: 'pending_payment',
        requested_at: new Date().toISOString(),
      }
    ])
    .select()
    .single()

  if (reviewError) {
    throw new Error(`Failed to create review request: ${reviewError.message}`)
  }

  // Create notification for user
  await supabase.rpc('create_notification', {
    p_user_id: user.id,
    p_type: 'review_request_created',
    p_title: '리뷰 요청이 생성되었습니다',
    p_message: `${career.title} 경력에 대한 전문가 리뷰 요청이 생성되었습니다. 결제를 완료해주세요.`,
    p_data: {
      review_request_id: reviewRequest.id,
      career_id: careerId,
      order_id: orderId
    }
  })

  return new Response(
    JSON.stringify({
      success: true,
      reviewRequest,
      orderId,
      paymentRequired: true
    }),
    { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleGetExpertRequests(req: Request, supabase: any, user: any) {
  // Get requests assigned to this expert
  const { data: requests, error } = await supabase
    .from('review_requests')
    .select(`
      *,
      careers (
        id,
        title,
        company,
        description,
        technologies,
        start_date,
        end_date
      ),
      users (
        id,
        name,
        email
      )
    `)
    .eq('expert_id', user.id)
    .order('requested_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch expert requests: ${error.message}`)
  }

  return new Response(
    JSON.stringify({
      success: true,
      requests
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleGetUserRequests(req: Request, supabase: any, user: any) {
  // Get requests created by this user
  const { data: requests, error } = await supabase
    .from('review_requests')
    .select(`
      *,
      careers (
        id,
        title,
        company,
        description,
        technologies
      ),
      expert_profiles (
        id,
        company,
        position,
        experience_years,
        rating
      )
    `)
    .eq('user_id', user.id)
    .order('requested_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch user requests: ${error.message}`)
  }

  return new Response(
    JSON.stringify({
      success: true,
      requests
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleGetAvailableRequests(req: Request, supabase: any, user: any) {
  // Get expert profile to check specializations
  const { data: expertProfile, error: expertError } = await supabase
    .from('expert_profiles')
    .select('specializations')
    .eq('user_id', user.id)
    .single()

  if (expertError || !expertProfile) {
    return new Response(
      JSON.stringify({ error: 'Expert profile not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Get unassigned requests that match expert's specializations
  const { data: requests, error } = await supabase
    .from('review_requests')
    .select(`
      *,
      careers (
        id,
        title,
        company,
        description,
        technologies,
        start_date,
        end_date
      ),
      users (
        id,
        name
      )
    `)
    .is('expert_id', null)
    .eq('status', 'pending_assignment')
    .eq('payment_status', 'paid')
    .overlaps('requested_specializations', expertProfile.specializations)
    .order('requested_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch available requests: ${error.message}`)
  }

  return new Response(
    JSON.stringify({
      success: true,
      requests
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleAcceptReviewRequest(req: Request, supabase: any, user: any) {
  const { reviewRequestId, estimatedCompletionTime } = await req.json()

  if (!reviewRequestId) {
    return new Response(
      JSON.stringify({ error: 'Review request ID is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Check if request is available for assignment
  const { data: request, error: requestError } = await supabase
    .from('review_requests')
    .select('*, careers(title), users(name)')
    .eq('id', reviewRequestId)
    .is('expert_id', null)
    .eq('status', 'pending_assignment')
    .single()

  if (requestError || !request) {
    return new Response(
      JSON.stringify({ error: 'Review request not available for assignment' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Assign request to expert
  const { data: updatedRequest, error: updateError } = await supabase
    .from('review_requests')
    .update({
      expert_id: user.id,
      status: 'assigned',
      assigned_at: new Date().toISOString(),
      estimated_completion_time: estimatedCompletionTime
    })
    .eq('id', reviewRequestId)
    .select()
    .single()

  if (updateError) {
    throw new Error(`Failed to accept review request: ${updateError.message}`)
  }

  // Notify user that expert has been assigned
  await supabase.rpc('create_notification', {
    p_user_id: request.user_id,
    p_type: 'review_assigned',
    p_title: '전문가가 배정되었습니다',
    p_message: `${request.careers.title} 경력 검토에 전문가가 배정되어 곧 검토가 시작됩니다.`,
    p_data: {
      review_request_id: reviewRequestId,
      expert_id: user.id
    }
  })

  // Notify expert of assignment
  await supabase.rpc('create_notification', {
    p_user_id: user.id,
    p_type: 'review_accepted',
    p_title: '리뷰 요청을 수락했습니다',
    p_message: `${request.careers.title} 경력 검토를 시작해주세요.`,
    p_data: {
      review_request_id: reviewRequestId,
      user_name: request.users.name
    }
  })

  return new Response(
    JSON.stringify({
      success: true,
      request: updatedRequest
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleUpdateReviewStatus(req: Request, supabase: any, user: any) {
  const { reviewRequestId, status, reviewResult, completionNotes } = await req.json()

  if (!reviewRequestId || !status) {
    return new Response(
      JSON.stringify({ error: 'Review request ID and status are required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Verify user has permission to update this request
  const { data: request, error: requestError } = await supabase
    .from('review_requests')
    .select('*, careers(title), users(name)')
    .eq('id', reviewRequestId)
    .single()

  if (requestError || !request) {
    return new Response(
      JSON.stringify({ error: 'Review request not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Check permissions
  const isExpert = request.expert_id === user.id
  const isOwner = request.user_id === user.id
  
  if (!isExpert && !isOwner) {
    return new Response(
      JSON.stringify({ error: 'Access denied' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const updateData: any = {
    status: status,
    updated_at: new Date().toISOString()
  }

  if (status === 'completed') {
    updateData.completed_at = new Date().toISOString()
    updateData.completion_notes = completionNotes
    
    // Save review result
    if (reviewResult) {
      const { data: result, error: resultError } = await supabase
        .from('review_results')
        .insert([
          {
            review_request_id: reviewRequestId,
            expert_id: user.id,
            result_data: reviewResult,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single()

      if (resultError) {
        throw new Error(`Failed to save review result: ${resultError.message}`)
      }
    }
  }

  // Update request status
  const { data: updatedRequest, error: updateError } = await supabase
    .from('review_requests')
    .update(updateData)
    .eq('id', reviewRequestId)
    .select()
    .single()

  if (updateError) {
    throw new Error(`Failed to update review status: ${updateError.message}`)
  }

  // Send appropriate notifications
  if (status === 'completed') {
    await supabase.rpc('create_notification', {
      p_user_id: request.user_id,
      p_type: 'review_completed',
      p_title: '경력 검토가 완료되었습니다',
      p_message: `${request.careers.title} 경력에 대한 전문가 검토가 완료되었습니다. 결과를 확인해보세요.`,
      p_data: {
        review_request_id: reviewRequestId,
        expert_id: user.id
      }
    })
  }

  return new Response(
    JSON.stringify({
      success: true,
      request: updatedRequest
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleCancelReviewRequest(req: Request, supabase: any, user: any) {
  const url = new URL(req.url)
  const reviewRequestId = url.searchParams.get('id')

  if (!reviewRequestId) {
    return new Response(
      JSON.stringify({ error: 'Review request ID is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Verify user owns the request
  const { data: request, error: requestError } = await supabase
    .from('review_requests')
    .select('*')
    .eq('id', reviewRequestId)
    .eq('user_id', user.id)
    .single()

  if (requestError || !request) {
    return new Response(
      JSON.stringify({ error: 'Review request not found or access denied' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Check if request can be cancelled
  if (['completed', 'cancelled'].includes(request.status)) {
    return new Response(
      JSON.stringify({ error: 'Cannot cancel completed or already cancelled request' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Cancel the request
  const { error: cancelError } = await supabase
    .from('review_requests')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString()
    })
    .eq('id', reviewRequestId)

  if (cancelError) {
    throw new Error(`Failed to cancel review request: ${cancelError.message}`)
  }

  // Notify expert if assigned
  if (request.expert_id) {
    await supabase.rpc('create_notification', {
      p_user_id: request.expert_id,
      p_type: 'review_cancelled',
      p_title: '리뷰 요청이 취소되었습니다',
      p_message: '배정된 리뷰 요청이 사용자에 의해 취소되었습니다.',
      p_data: {
        review_request_id: reviewRequestId
      }
    })
  }

  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}