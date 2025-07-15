import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createSupabaseClient, getUserFromAuthHeader } from '../_shared/supabase.ts'

interface FileUploadRequest {
  fileName: string
  fileType: string
  fileSize: number
  category: 'resume' | 'portfolio' | 'certificate' | 'document'
  relatedId?: string
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/jpg',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
]

const DANGEROUS_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar', '.php', '.asp', '.aspx'
]

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createSupabaseClient()
    const user = await getUserFromAuthHeader(req.headers.get('authorization'))

    if (req.method === 'POST') {
      return await handleFileUpload(req, supabase, user)
    } else if (req.method === 'GET') {
      return await handleGetSignedUrl(req, supabase, user)
    } else if (req.method === 'DELETE') {
      return await handleDeleteFile(req, supabase, user)
    } else {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('File upload error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function handleFileUpload(req: Request, supabase: any, user: any) {
  const formData = await req.formData()
  const file = formData.get('file') as File
  const category = formData.get('category') as string
  const relatedId = formData.get('relatedId') as string || null

  if (!file) {
    return new Response(
      JSON.stringify({ error: 'No file provided' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Validate file
  const validationResult = await validateFile(file)
  if (!validationResult.isValid) {
    return new Response(
      JSON.stringify({ error: validationResult.error }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Generate unique file name
  const fileExtension = file.name.split('.').pop()
  const fileName = `${user.id}/${category}/${Date.now()}-${crypto.randomUUID()}.${fileExtension}`

  // Upload file to Supabase storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('career-files')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (uploadError) {
    throw new Error(`File upload failed: ${uploadError.message}`)
  }

  // Save file metadata to database
  const { data: fileRecord, error: dbError } = await supabase
    .from('file_attachments')
    .insert([
      {
        user_id: user.id,
        file_name: file.name,
        file_path: fileName,
        file_type: file.type,
        file_size: file.size,
        category: category,
        related_id: relatedId,
        upload_status: 'completed',
        created_at: new Date().toISOString(),
      }
    ])
    .select()
    .single()

  if (dbError) {
    // Clean up uploaded file if database insert fails
    await supabase.storage.from('career-files').remove([fileName])
    throw new Error(`Failed to save file metadata: ${dbError.message}`)
  }

  // Perform virus scan (mock implementation)
  await performVirusScan(supabase, fileRecord.id, fileName)

  return new Response(
    JSON.stringify({
      success: true,
      file: fileRecord,
      downloadUrl: await getSignedUrl(supabase, fileName, 3600)
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleGetSignedUrl(req: Request, supabase: any, user: any) {
  const url = new URL(req.url)
  const filePath = url.searchParams.get('filePath')
  const expiresIn = parseInt(url.searchParams.get('expiresIn') || '3600')

  if (!filePath) {
    return new Response(
      JSON.stringify({ error: 'File path is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Check if user has permission to access this file
  const { data: fileRecord, error: fileError } = await supabase
    .from('file_attachments')
    .select('*')
    .eq('file_path', filePath)
    .single()

  if (fileError || !fileRecord) {
    return new Response(
      JSON.stringify({ error: 'File not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Check if user owns the file or has permission to access it
  if (fileRecord.user_id !== user.id) {
    // Additional permission checks can be added here
    // For now, only allow file owner to access
    return new Response(
      JSON.stringify({ error: 'Access denied' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const signedUrl = await getSignedUrl(supabase, filePath, expiresIn)

  return new Response(
    JSON.stringify({
      success: true,
      url: signedUrl,
      expiresIn: expiresIn
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleDeleteFile(req: Request, supabase: any, user: any) {
  const url = new URL(req.url)
  const fileId = url.searchParams.get('fileId')

  if (!fileId) {
    return new Response(
      JSON.stringify({ error: 'File ID is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Get file record and check ownership
  const { data: fileRecord, error: fileError } = await supabase
    .from('file_attachments')
    .select('*')
    .eq('id', fileId)
    .eq('user_id', user.id)
    .single()

  if (fileError || !fileRecord) {
    return new Response(
      JSON.stringify({ error: 'File not found or access denied' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Delete file from storage
  const { error: storageError } = await supabase.storage
    .from('career-files')
    .remove([fileRecord.file_path])

  if (storageError) {
    console.error('Storage deletion error:', storageError)
    // Continue with database deletion even if storage fails
  }

  // Delete file record from database
  const { error: dbError } = await supabase
    .from('file_attachments')
    .delete()
    .eq('id', fileId)

  if (dbError) {
    throw new Error(`Failed to delete file record: ${dbError.message}`)
  }

  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function validateFile(file: File) {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`
    }
  }

  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: `File type ${file.type} is not allowed`
    }
  }

  // Check file extension
  const extension = '.' + file.name.split('.').pop()?.toLowerCase()
  if (DANGEROUS_EXTENSIONS.includes(extension)) {
    return {
      isValid: false,
      error: `File extension ${extension} is not allowed for security reasons`
    }
  }

  // Check file name for suspicious patterns
  const suspiciousPatterns = [
    /[<>:"/\\|?*]/,  // Windows invalid characters
    /^\./,           // Hidden files
    /\x00/,          // Null bytes
  ]

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(file.name)) {
      return {
        isValid: false,
        error: 'File name contains invalid characters'
      }
    }
  }

  return { isValid: true }
}

async function performVirusScan(supabase: any, fileId: string, filePath: string) {
  // Mock virus scan implementation
  // In production, this would integrate with a real virus scanning service
  
  try {
    // Simulate virus scan delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Update file status to scanned
    await supabase
      .from('file_attachments')
      .update({ 
        scan_status: 'clean',
        scanned_at: new Date().toISOString()
      })
      .eq('id', fileId)
    
    console.log(`Virus scan completed for file ${filePath}: CLEAN`)
  } catch (error) {
    console.error(`Virus scan failed for file ${filePath}:`, error)
    
    // Mark as scan failed
    await supabase
      .from('file_attachments')
      .update({ 
        scan_status: 'failed',
        scanned_at: new Date().toISOString()
      })
      .eq('id', fileId)
  }
}

async function getSignedUrl(supabase: any, filePath: string, expiresIn: number = 3600) {
  const { data } = await supabase.storage
    .from('career-files')
    .createSignedUrl(filePath, expiresIn)
  
  return data?.signedUrl
}