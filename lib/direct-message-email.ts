import { Resend } from 'resend'

const MESSAGE_URL = 'https://connect.hysky.org/messages'
const LOGO_URL = 'https://connect.hysky.org/hysky-connect-light.png'
const FROM_EMAIL = process.env.RESEND_NOTIFICATIONS_FROM_EMAIL
  ?? 'HySky Connect <notifications@hysky.org>'

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

export async function sendDirectMessageEmail({
  to,
  senderName,
}: {
  to: string
  senderName: string
}) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return

  const resend = new Resend(apiKey)
  const safeSenderName = escapeHtml(senderName)
  const subject = `${senderName} sent you a private message on HySky Connect`

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    replyTo: 'admin@hysky.org',
    subject,
    text: `${senderName} sent you a private message on HySky Connect. Open your messages: ${MESSAGE_URL}`,
    html: `
      <div style="background:#f5f7ff;padding:32px 16px;font-family:Arial,sans-serif;color:#111827">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #d9d5ff;border-radius:18px;overflow:hidden">
          <div style="height:5px;background:linear-gradient(90deg,#5d00f5,#13dce8)"></div>
          <div style="padding:28px 32px 32px">
          <img src="${LOGO_URL}" width="240" alt="HySky Connect" style="display:block;width:240px;max-width:100%;height:auto;margin:0 0 26px" />
          <h1 style="margin:0 0 14px;font-size:24px;line-height:1.3">You have a new private message</h1>
          <p style="margin:0 0 24px;font-size:16px;line-height:1.6"><strong>${safeSenderName}</strong> sent you a private message.</p>
          <a href="${MESSAGE_URL}" style="display:inline-block;background:#5d00f5;color:#ffffff;text-decoration:none;font-weight:700;padding:13px 20px;border-radius:10px;box-shadow:0 8px 22px rgba(93,0,245,.22)">Open Messages</a>
          <p style="margin:24px 0 0;color:#6b7280;font-size:12px;line-height:1.5">For privacy, the message itself is only shown inside HySky Connect.</p>
          </div>
        </div>
      </div>
    `,
  })

  if (error) throw new Error(`Resend failed: ${error.message}`)
}
