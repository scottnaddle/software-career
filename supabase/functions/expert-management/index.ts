import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createSupabaseClient, getUserFromAuthHeader } from '../_shared/supabase.ts'

interface ExpertApplication {
  expert_type: 'individual' | 'organization'
  specializations: string[]
  experience_years: number
  education: string
  certifications: string[]
  company: string
  position: string
  bio: string
  linkedin_url: string
  website_url: string
  hourly_rate: number
}

interface ExpertApproval {
  expertId: string
  status: 'approved' | 'rejected' | 'suspended'
  rejectionReason?: string
  reviewerNotes?: string
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
      if (pathname.endsWith('/profile')) {
        return await handleGetExpertProfile(req, supabase, user)
      } else if (pathname.endsWith('/applications')) {
        return await handleGetExpertApplications(req, supabase, user)
      } else if (pathname.endsWith('/specializations')) {
        return await handleGetSpecializations(req, supabase, user)
      } else if (pathname.endsWith('/statistics')) {
        return await handleGetExpertStatistics(req, supabase, user)
      } else {
        return await handleGetExpertProfile(req, supabase, user)
      }
    } else if (req.method === 'POST') {
      if (pathname.endsWith('/apply')) {
        return await handleExpertApplication(req, supabase, user)
      } else if (pathname.endsWith('/approve')) {
        return await handleApproveExpert(req, supabase, user)
      } else if (pathname.endsWith('/reject')) {
        return await handleRejectExpert(req, supabase, user)
      } else {
        return await handleExpertApplication(req, supabase, user)
      }
    } else if (req.method === 'PUT') {
      return await handleUpdateExpertProfile(req, supabase, user)
    } else if (req.method === 'DELETE') {
      return await handleDeleteExpertProfile(req, supabase, user)
    } else {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('Expert management error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function handleExpertApplication(req: Request, supabase: any, user: any) {
  const applicationData: ExpertApplication = await req.json()

  // Validate required fields
  if (!applicationData.specializations?.length || !applicationData.experience_years || !applicationData.bio) {
    return new Response(
      JSON.stringify({ error: 'Missing required fields' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Check if user already has an expert profile
  const { data: existingProfile, error: existingError } = await supabase
    .from('expert_profiles')
    .select('id, status')
    .eq('user_id', user.id)
    .single()

  if (existingProfile && existingProfile.status !== 'rejected') {
    return new Response(
      JSON.stringify({ error: 'Expert application already exists' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Create or update expert profile
  const profileData = {
    user_id: user.id,
    expert_type: applicationData.expert_type,
    specializations: applicationData.specializations,
    experience_years: applicationData.experience_years,
    education: applicationData.education,
    certifications: applicationData.certifications,
    company: applicationData.company,
    position: applicationData.position,
    bio: applicationData.bio,
    linkedin_url: applicationData.linkedin_url,
    website_url: applicationData.website_url,
    hourly_rate: applicationData.hourly_rate,
    status: 'pending',
    applied_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  let expertProfile
  
  if (existingProfile) {
    // Update existing profile
    const { data, error } = await supabase
      .from('expert_profiles')
      .update(profileData)
      .eq('id', existingProfile.id)
      .select()
      .single()
    
    if (error) {
      throw new Error(`Failed to update expert profile: ${error.message}`)
    }
    expertProfile = data
  } else {
    // Create new profile
    const { data, error } = await supabase
      .from('expert_profiles')
      .insert([profileData])
      .select()
      .single()
    
    if (error) {
      throw new Error(`Failed to create expert profile: ${error.message}`)
    }
    expertProfile = data
  }

  // Create notification for user
  await supabase.rpc('create_notification', {
    p_user_id: user.id,
    p_type: 'expert_application_submitted',
    p_title: '전문가 신청이 접수되었습니다',
    p_message: '전문가 신청서가 성공적으로 접수되었습니다. 검토 후 결과를 안내드리겠습니다.',
    p_data: {
      expert_profile_id: expertProfile.id
    }
  })

  // Notify admin (if admin notification system is set up)
  await notifyAdminOfNewApplication(supabase, expertProfile)

  return new Response(
    JSON.stringify({
      success: true,
      profile: expertProfile
    }),
    { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleGetExpertProfile(req: Request, supabase: any, user: any) {
  const url = new URL(req.url)
  const expertId = url.searchParams.get('id')
  
  let query = supabase
    .from('expert_profiles')
    .select(`
      *,
      users (
        id,
        name,
        email,
        created_at
      )
    `)

  if (expertId) {
    query = query.eq('id', expertId)
  } else {
    query = query.eq('user_id', user.id)
  }

  const { data: profile, error } = await query.single()

  if (error) {
    if (error.code === 'PGRST116') {
      return new Response(
        JSON.stringify({ error: 'Expert profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    throw new Error(`Failed to fetch expert profile: ${error.message}`)
  }

  // Get expert statistics
  const { data: stats, error: statsError } = await supabase
    .from('review_requests')
    .select(`
      id,
      status,
      completed_at,
      review_fee,
      rating
    `)
    .eq('expert_id', profile.user_id)

  if (statsError) {
    console.error('Failed to fetch expert statistics:', statsError)
  }

  const statistics = calculateExpertStatistics(stats || [])

  return new Response(
    JSON.stringify({
      success: true,
      profile: {
        ...profile,
        statistics
      }
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleGetExpertApplications(req: Request, supabase: any, user: any) {
  // Check if user is admin
  const { data: userRole, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (roleError || userRole?.role !== 'admin') {
    return new Response(
      JSON.stringify({ error: 'Access denied' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const url = new URL(req.url)
  const status = url.searchParams.get('status')
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const offset = parseInt(url.searchParams.get('offset') || '0')

  let query = supabase
    .from('expert_profiles')
    .select(`
      *,
      users (
        id,
        name,
        email,
        created_at
      )
    `)
    .order('applied_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status) {
    query = query.eq('status', status)
  }

  const { data: applications, error } = await query

  if (error) {
    throw new Error(`Failed to fetch expert applications: ${error.message}`)
  }

  return new Response(
    JSON.stringify({
      success: true,
      applications
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleApproveExpert(req: Request, supabase: any, user: any) {
  const { expertId, reviewerNotes } = await req.json()

  // Check if user is admin
  const { data: userRole, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (roleError || userRole?.role !== 'admin') {
    return new Response(
      JSON.stringify({ error: 'Access denied' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Update expert profile status
  const { data: updatedProfile, error: updateError } = await supabase
    .from('expert_profiles')
    .update({
      status: 'approved',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      reviewer_notes: reviewerNotes,
      updated_at: new Date().toISOString()
    })
    .eq('id', expertId)
    .select(`
      *,
      users (
        id,
        name,
        email
      )
    `)
    .single()

  if (updateError) {
    throw new Error(`Failed to approve expert: ${updateError.message}`)
  }

  // Create notification for expert
  await supabase.rpc('create_notification', {
    p_user_id: updatedProfile.user_id,
    p_type: 'expert_approved',
    p_title: '전문가 신청이 승인되었습니다',
    p_message: '축하합니다! 전문가 신청이 승인되어 이제 경력 검토를 시작할 수 있습니다.',
    p_data: {
      expert_profile_id: expertId
    }
  })

  // Send welcome email (if email service is configured)
  await sendWelcomeEmail(updatedProfile.users.email, updatedProfile.users.name)

  return new Response(
    JSON.stringify({
      success: true,
      profile: updatedProfile
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleRejectExpert(req: Request, supabase: any, user: any) {
  const { expertId, rejectionReason, reviewerNotes } = await req.json()

  // Check if user is admin
  const { data: userRole, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (roleError || userRole?.role !== 'admin') {
    return new Response(
      JSON.stringify({ error: 'Access denied' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Update expert profile status
  const { data: updatedProfile, error: updateError } = await supabase
    .from('expert_profiles')
    .update({
      status: 'rejected',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      rejection_reason: rejectionReason,
      reviewer_notes: reviewerNotes,
      updated_at: new Date().toISOString()
    })
    .eq('id', expertId)
    .select(`
      *,
      users (
        id,
        name,
        email
      )
    `)
    .single()

  if (updateError) {
    throw new Error(`Failed to reject expert: ${updateError.message}`)
  }

  // Create notification for expert
  await supabase.rpc('create_notification', {
    p_user_id: updatedProfile.user_id,
    p_type: 'expert_rejected',
    p_title: '전문가 신청이 검토되었습니다',
    p_message: `전문가 신청이 검토되었습니다. ${rejectionReason || '자세한 내용은 이메일을 확인해주세요.'}`,
    p_data: {
      expert_profile_id: expertId,
      rejection_reason: rejectionReason
    }
  })

  return new Response(
    JSON.stringify({
      success: true,
      profile: updatedProfile
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleGetSpecializations(req: Request, supabase: any, user: any) {
  const { data: specializations, error } = await supabase
    .from('specialization_categories')
    .select('*')
    .eq('active', true)
    .order('display_order', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch specializations: ${error.message}`)
  }

  return new Response(
    JSON.stringify({
      success: true,
      specializations
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleGetExpertStatistics(req: Request, supabase: any, user: any) {
  const { data: profile, error: profileError } = await supabase
    .from('expert_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (profileError) {
    return new Response(
      JSON.stringify({ error: 'Expert profile not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { data: requests, error: requestsError } = await supabase
    .from('review_requests')
    .select('*')
    .eq('expert_id', user.id)

  if (requestsError) {
    throw new Error(`Failed to fetch review requests: ${requestsError.message}`)
  }

  const statistics = calculateExpertStatistics(requests || [])

  return new Response(
    JSON.stringify({
      success: true,
      statistics
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

function calculateExpertStatistics(requests: any[]) {
  const completed = requests.filter(r => r.status === 'completed')
  const totalEarnings = completed.reduce((sum, r) => sum + (r.review_fee || 0), 0)
  const averageRating = completed.length > 0 
    ? completed.reduce((sum, r) => sum + (r.rating || 0), 0) / completed.length 
    : 0

  const thisMonth = new Date()
  const thisMonthCompleted = completed.filter(r => {
    const completedDate = new Date(r.completed_at)
    return completedDate.getMonth() === thisMonth.getMonth() && 
           completedDate.getFullYear() === thisMonth.getFullYear()
  })

  return {
    totalReviews: requests.length,
    completedReviews: completed.length,
    pendingReviews: requests.filter(r => ['assigned', 'in_progress'].includes(r.status)).length,
    totalEarnings,
    averageRating,
    thisMonthReviews: thisMonthCompleted.length,
    thisMonthEarnings: thisMonthCompleted.reduce((sum, r) => sum + (r.review_fee || 0), 0)
  }
}

async function notifyAdminOfNewApplication(supabase: any, profile: any) {
  try {
    // Get admin users
    const { data: admins, error } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin')

    if (error || !admins?.length) {
      console.log('No admin users found for notification')
      return
    }

    // Create notification for each admin
    for (const admin of admins) {
      await supabase.rpc('create_notification', {
        p_user_id: admin.user_id,
        p_type: 'new_expert_application',
        p_title: '새로운 전문가 신청',
        p_message: `새로운 전문가 신청이 접수되었습니다. 검토가 필요합니다.`,
        p_data: {
          expert_profile_id: profile.id,
          applicant_name: profile.company || '전문가',
          specializations: profile.specializations
        }
      })
    }
  } catch (error) {
    console.error('Failed to notify admin of new application:', error)
  }
}

async function sendWelcomeEmail(email: string, name: string) {
  try {
    // TODO: Implement email sending service
    console.log(`Would send welcome email to ${email} for ${name}`)
    
    // This would integrate with email service like SendGrid, AWS SES, etc.
    // For now, just log the intent
  } catch (error) {
    console.error('Failed to send welcome email:', error)
  }
}