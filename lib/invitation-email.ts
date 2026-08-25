import { Resend } from 'resend'

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

export async function sendInvitationEmail({
  to,
  inviterName,
  invitationUrl,
}: {
  to: string
  inviterName: string
  invitationUrl: string
}) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('The email service is not configured.')

  const resend = new Resend(apiKey)
  const safeInviterName = escapeHtml(inviterName)

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    replyTo: 'admin@hysky.org',
    subject: `${inviterName} invited you to join HySky Connect`,
    text: `${inviterName} invited you to join HySky Connect. Create your account: ${invitationUrl}`,
    html: `
      <div style="background:#f5f7ff;padding:32px 16px;font-family:Arial,sans-serif;color:#111827">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #d9d5ff;border-radius:18px;overflow:hidden">
          <div style="height:5px;background:linear-gradient(90deg,#5d00f5,#13dce8)"></div>
          <div style="padding:28px 32px 32px">
            <img src="${LOGO_URL}" width="240" alt="HySky Connect" style="display:block;width:240px;max-width:100%;height:auto;margin:0 0 26px" />
            <h1 style="margin:0 0 14px;font-size:24px;line-height:1.3">You’re invited to HySky Connect</h1>
            <p style="margin:0 0 24px;font-size:16px;line-height:1.6"><strong>${safeInviterName}</strong> invited you to join the HySky Connect community.</p>
            <a href="${invitationUrl}" style="display:inline-block;background:#5d00f5;color:#ffffff;text-decoration:none;font-weight:700;padding:13px 20px;border-radius:10px;box-shadow:0 8px 22px rgba(93,0,245,.22)">Create Your Account</a>
            <p style="margin:24px 0 0;color:#6b7280;font-size:12px;line-height:1.5">This is a secure, personal invitation link. If you weren’t expecting this email, you can safely ignore it.</p>
          </div>
        </div>
      </div>
    `,
  })

  if (error) throw new Error(`Email delivery failed: ${error.message}`)
}
