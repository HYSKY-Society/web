import { currentUser } from '@clerk/nextjs/server'
import { put } from '@vercel/blob'
import { getUserTier, hasVipCommunityAccess } from '@/lib/members'
import { isAdmin } from '@/lib/admin'

const IMAGE_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif', 'image/svg+xml',
])

const ALLOWED_TYPES = new Set([
  ...IMAGE_TYPES,
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'text/plain',
])

export async function POST(req: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json({ error: 'File storage not configured — add BLOB_READ_WRITE_TOKEN to env vars' }, { status: 503 })
  }

  const user = await currentUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const email = user.emailAddresses.find((entry) => entry.id === user.primaryEmailAddressId)?.emailAddress ?? ''
  const tier = await getUserTier(user.id)
  if (!hasVipCommunityAccess(tier) && !isAdmin(email)) {
    return Response.json({ error: 'VIP Connect is required to post' }, { status: 403 })
  }

  const form = await req.formData()
  const file = form.get('file') as File | null
  if (!file || !ALLOWED_TYPES.has(file.type)) {
    return Response.json({ error: 'File type not supported' }, { status: 400 })
  }

  const isImage = IMAGE_TYPES.has(file.type)
  const maxSize = isImage ? 8 * 1024 * 1024 : 20 * 1024 * 1024
  if (file.size > maxSize) {
    return Response.json({ error: `File too large (max ${isImage ? '8' : '20'} MB)` }, { status: 400 })
  }

  try {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 80)
    const blob = await put(`feed/${user.id}/${Date.now()}_${safeName}`, file, { access: 'public' })
    return Response.json({ url: blob.url, name: file.name, type: file.type })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Upload failed'
    return Response.json({ error: msg }, { status: 500 })
  }
}
