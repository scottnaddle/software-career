import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export const createSupabaseClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )
}

export const getUserFromAuthHeader = async (authHeader: string | null) => {
  if (!authHeader) {
    throw new Error('No authorization header provided')
  }

  const supabase = createSupabaseClient()
  const token = authHeader.replace('Bearer ', '')
  
  const { data: { user }, error } = await supabase.auth.getUser(token)
  
  if (error) {
    throw new Error(`Authentication error: ${error.message}`)
  }
  
  if (!user) {
    throw new Error('User not found')
  }
  
  return user
}