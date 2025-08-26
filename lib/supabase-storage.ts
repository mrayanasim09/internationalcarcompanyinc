import { getSupabaseAdmin } from '@/lib/supabase/admin'

const DEFAULT_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'car-images'

export async function uploadImageToStorage(file: File): Promise<string> {
  const supabase = getSupabaseAdmin()

  const timestamp = Date.now()
  const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const objectPath = `${timestamp}-${cleanFileName}`
  const bucket = DEFAULT_BUCKET

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(objectPath, file, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    })

  if (uploadError) {
    throw new Error(`Supabase Storage upload failed: ${uploadError.message}`)
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath)
  if (!data?.publicUrl) {
    throw new Error('Failed to resolve public URL from Supabase Storage')
  }
  return data.publicUrl
}

export async function deleteImageFromStorage(url: string): Promise<void> {
  const supabase = getSupabaseAdmin()

  try {
    const parsed = new URL(url)
    // Expected: /storage/v1/object/public/<bucket>/<path>
    const segments = parsed.pathname.split('/').filter(Boolean)
    const publicIndex = segments.findIndex((s) => s === 'public')
    if (publicIndex === -1 || publicIndex + 2 > segments.length) {
      throw new Error('Unsupported Supabase Storage URL format')
    }

    const bucketFromUrl = segments[publicIndex + 1]
    const objectSegments = segments.slice(publicIndex + 2)
    const objectPath = decodeURIComponent(objectSegments.join('/'))

    const { error } = await supabase.storage.from(bucketFromUrl).remove([objectPath])
    if (error) {
      throw new Error(`Supabase Storage delete failed: ${error.message}`)
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'unknown error'
    throw new Error(`Failed to delete image from Supabase Storage: ${message}`)
  }
}

export async function uploadMultipleImages(files: File[]): Promise<string[]> {
  const uploads = files.map((f) => uploadImageToStorage(f))
  return Promise.all(uploads)
}


