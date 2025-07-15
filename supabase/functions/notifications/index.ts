import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createSupabaseClient, getUserFromAuthHeader } from '../_shared/supabase.ts'

interface CreateNotificationRequest {
  userId: string
  type: string
  title: string
  message: string
  data?: any
  priority?: 'low' | 'medium' | 'high'
}

interface UpdateNotificationRequest {
  notificationIds: string[]
  read?: boolean
  archived?: boolean
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
      return await handleGetNotifications(req, supabase, user)
    } else if (req.method === 'POST') {
      if (pathname.endsWith('/create')) {
        return await handleCreateNotification(req, supabase, user)
      } else if (pathname.endsWith('/mark-read')) {
        return await handleMarkAsRead(req, supabase, user)
      } else if (pathname.endsWith('/mark-all-read')) {
        return await handleMarkAllAsRead(req, supabase, user)
      } else {
        return await handleCreateNotification(req, supabase, user)
      }
    } else if (req.method === 'PUT') {
      return await handleUpdateNotification(req, supabase, user)
    } else if (req.method === 'DELETE') {
      return await handleDeleteNotification(req, supabase, user)
    } else {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('Notification error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function handleGetNotifications(req: Request, supabase: any, user: any) {
  const url = new URL(req.url)
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const offset = parseInt(url.searchParams.get('offset') || '0')
  const unreadOnly = url.searchParams.get('unread') === 'true'
  const type = url.searchParams.get('type')

  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (unreadOnly) {
    query = query.is('read_at', null)
  }

  if (type) {
    query = query.eq('type', type)
  }

  const { data: notifications, error } = await query

  if (error) {
    throw new Error(`Failed to fetch notifications: ${error.message}`)
  }

  // Get unread count
  const { count: unreadCount, error: countError } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .is('read_at', null)

  if (countError) {
    console.error('Error counting unread notifications:', countError)
  }

  return new Response(
    JSON.stringify({
      success: true,
      notifications,
      unreadCount: unreadCount || 0,
      hasMore: notifications.length === limit
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleCreateNotification(req: Request, supabase: any, user: any) {
  const body: CreateNotificationRequest = await req.json()
  
  const { userId, type, title, message, data, priority = 'medium' } = body

  if (!userId || !type || !title || !message) {
    return new Response(
      JSON.stringify({ error: 'Missing required fields' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Create notification using RPC function
  const { data: notification, error } = await supabase.rpc('create_notification', {
    p_user_id: userId,
    p_type: type,
    p_title: title,
    p_message: message,
    p_data: data || {},
    p_priority: priority
  })

  if (error) {
    throw new Error(`Failed to create notification: ${error.message}`)
  }

  // Send real-time notification if user is online
  await sendRealTimeNotification(supabase, userId, notification)

  // Send push notification if enabled
  await sendPushNotification(supabase, userId, notification)

  return new Response(
    JSON.stringify({
      success: true,
      notification
    }),
    { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleMarkAsRead(req: Request, supabase: any, user: any) {
  const { notificationId } = await req.json()

  if (!notificationId) {
    return new Response(
      JSON.stringify({ error: 'Notification ID is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .eq('user_id', user.id)

  if (error) {
    throw new Error(`Failed to mark notification as read: ${error.message}`)
  }

  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleMarkAllAsRead(req: Request, supabase: any, user: any) {
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .is('read_at', null)

  if (error) {
    throw new Error(`Failed to mark all notifications as read: ${error.message}`)
  }

  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleUpdateNotification(req: Request, supabase: any, user: any) {
  const url = new URL(req.url)
  const notificationId = url.searchParams.get('id')
  const body: UpdateNotificationRequest = await req.json()

  if (!notificationId) {
    return new Response(
      JSON.stringify({ error: 'Notification ID is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const updateData: any = {}
  
  if (body.read !== undefined) {
    updateData.read_at = body.read ? new Date().toISOString() : null
  }
  
  if (body.archived !== undefined) {
    updateData.archived_at = body.archived ? new Date().toISOString() : null
  }

  const { data: notification, error } = await supabase
    .from('notifications')
    .update(updateData)
    .eq('id', notificationId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update notification: ${error.message}`)
  }

  return new Response(
    JSON.stringify({
      success: true,
      notification
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleDeleteNotification(req: Request, supabase: any, user: any) {
  const url = new URL(req.url)
  const notificationId = url.searchParams.get('id')

  if (!notificationId) {
    return new Response(
      JSON.stringify({ error: 'Notification ID is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)
    .eq('user_id', user.id)

  if (error) {
    throw new Error(`Failed to delete notification: ${error.message}`)
  }

  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function sendRealTimeNotification(supabase: any, userId: string, notification: any) {
  try {
    // Send real-time notification using Supabase realtime
    await supabase.channel('notifications')
      .send({
        type: 'broadcast',
        event: 'new_notification',
        payload: {
          userId,
          notification
        }
      })
  } catch (error) {
    console.error('Failed to send real-time notification:', error)
  }
}

async function sendPushNotification(supabase: any, userId: string, notification: any) {
  try {
    // Get user's push subscription
    const { data: userSettings } = await supabase
      .from('user_settings')
      .select('push_subscription, push_notifications_enabled')
      .eq('user_id', userId)
      .single()

    if (!userSettings?.push_notifications_enabled || !userSettings?.push_subscription) {
      return
    }

    // Send push notification using Web Push API
    // This would require implementing actual push notification service
    // For now, just log the intent
    console.log('Would send push notification to user:', userId, notification.title)
    
    // TODO: Implement actual push notification sending
    // This would involve:
    // 1. Using web-push library
    // 2. Validating VAPID keys
    // 3. Sending to service worker
    
  } catch (error) {
    console.error('Failed to send push notification:', error)
  }
}