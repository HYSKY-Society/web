import { currentUser } from '@clerk/nextjs/server'
import { put } from '@vercel/blob'

export async function POST(req: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json({ error: 'Image storage not configured — add BLOB_READ_WRITE_TOKEN to env vars' }, { status: 503 })
  }

  const user = await currentUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await req.formData()
  const file = form.get('file') as File | null
  if (!file || !file.type.startsWith('image/')) {
    return Response.json({ error: 'Invalid file' }, { status: 400 })
  }
  if (file.size > 8 * 1024 * 1024) {
    return Response.json({ error: 'File too large (max 8 MB)' }, { status: 400 })
  }

  try {
    const ext = file.name.split('.').pop() ?? 'jpg'
    const blob = await put(`feed/${user.id}/${Date.now()}.${ext}`, file, { access: 'public' })
    return Response.json({ url: blob.url })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Upload failed'
    return Response.json({ error: msg }, { status: 500 })
  }
}
