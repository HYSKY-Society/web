import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { currentUser } from '@clerk/nextjs/server'
import { getUserTier, hasVipCommunityAccess } from '@/lib/members'
import { isAdmin } from '@/lib/admin'

const IMAGE_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif', 'image/svg+xml',
]

const DOC_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'text/plain',
]

export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        const user = await currentUser()
        if (!user) throw new Error('Unauthorized')
        const email = user.emailAddresses.find((entry) => entry.id === user.primaryEmailAddressId)?.emailAddress ?? ''
        const tier = await getUserTier(user.id)
        if (!hasVipCommunityAccess(tier) && !isAdmin(email)) {
          throw new Error('VIP Connect is required to post')
        }

        let kind = 'file'
        try {
          kind = clientPayload ? (JSON.parse(clientPayload).kind ?? 'file') : 'file'
        } catch {}
        const isImageUpload = kind === 'image'

        return {
          allowedContentTypes: [...IMAGE_TYPES, ...DOC_TYPES],
          maximumSizeInBytes: isImageUpload ? 8 * 1024 * 1024 : 20 * 1024 * 1024,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ userId: user.id }),
        }
      },
      onUploadCompleted: async () => {
        // No server-side bookkeeping needed — the client stores the returned blob URL
        // directly on the post/attachment; nothing to persist here.
      },
    })

    return Response.json(jsonResponse)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Upload failed'
    return Response.json({ error: msg }, { status: 400 })
  }
}
