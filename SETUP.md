# HYSKY Society — Setup Guide

## How access control works

```
Anyone can sign up with Clerk (email/password, Google, or Apple)
     ↓
Every request to /dashboard checks the Google Sheet (cached 5 min)
     ↓
Email in sheet → access granted
Email not in sheet → /not-authorized (with link to join)
```

You manage membership entirely by editing the Google Sheet.
Add a row → member gets access within 5 minutes.
Delete a row → member loses access within 5 minutes.
No code changes or redeployment needed.

---

## 1. Google Sheet setup

1. Create a Google Sheet with emails in **column A**, one per row.
   Row 1 should be a header (e.g. "Email") — it is automatically skipped.

   | A |
   |---|
   | Email |
   | alice@example.com |
   | bob@company.org |

2. Share the sheet: **Share → Anyone with the link → Viewer**

3. Copy the Sheet ID from the URL:
   `https://docs.google.com/spreadsheets/d/**SHEET_ID**/edit`

## 2. Google Sheets API key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project (or use an existing one)
3. Enable the **Google Sheets API** (APIs & Services → Enable APIs)
4. Create credentials: **APIs & Services → Credentials → Create API Key**
5. Restrict the key: click the key → **API restrictions → Google Sheets API only**
6. Copy the key

## 3. Clerk setup

1. Create a free account at [clerk.com](https://clerk.com)
2. Create a new application — choose **Next.js**
3. Enable **Google** and **Apple** sign-in:
   Dashboard → Social Connections → toggle on
4. Copy your API keys (Dashboard → API Keys)

## 4. Local development

```bash
cp .env.local.example .env.local
# Fill in all variables, then:
npm install
npm run dev
```

## 5. First admin account

1. Sign up at http://localhost:3000/sign-up with your admin email
2. Add your email to the Google Sheet (gives you dashboard access)
3. Add your email to `.env.local` as `ADMIN_EMAILS` (gives you `/admin` access)

## 6. Clerk Webhook (optional — logs unauthorized sign-up attempts)

1. Dashboard → Webhooks → Add Endpoint
2. URL: `https://YOUR-DOMAIN.vercel.app/api/webhooks/clerk`
3. Subscribe to: `user.created`
4. Copy the Signing Secret → add as `CLERK_WEBHOOK_SECRET`

## 7. Deploy to Vercel

```bash
npx vercel
```

Add all env vars from `.env.local` in:
**Vercel Dashboard → Project → Settings → Environment Variables**

---

## Zapier / Zeffy integration

When a member pays on Zeffy, set up a Zap:

1. **Trigger:** Zeffy — New Registration (or payment confirmation)
2. **Action:** Google Sheets — Create Spreadsheet Row
3. Map the member's email to column A

Members get access automatically within 5 minutes of the row being added.
To revoke access, delete their row from the sheet.
