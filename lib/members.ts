type SheetsResponse = {
  values?: string[][]
}

/**
 * Fetches the whitelisted email list from Google Sheets.
 * Results are cached by Next.js for 5 minutes (revalidate: 300).
 *
 * Sheet format: Column A contains email addresses, row 1 is a header.
 * The range env var defaults to "A2:A1000" to skip the header row.
 */
export async function fetchWhitelistedEmails(): Promise<Set<string>> {
  const sheetId = process.env.GOOGLE_SHEET_ID
  const apiKey = process.env.GOOGLE_SHEETS_API_KEY
  const range = process.env.GOOGLE_SHEET_RANGE ?? 'Members!A2:A1000'

  if (!sheetId || !apiKey) {
    console.error('[members] GOOGLE_SHEET_ID or GOOGLE_SHEETS_API_KEY is not set')
    return new Set()
  }

  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/` +
    `${encodeURIComponent(range)}?key=${apiKey}`

  let res: Response
  try {
    // Next.js caches this fetch for 5 minutes across all requests
    res = await fetch(url, { next: { revalidate: 300 } })
  } catch (err) {
    console.error('[members] Network error fetching sheet:', err)
    return new Set()
  }

  if (!res.ok) {
    console.error(`[members] Sheets API returned ${res.status}: ${await res.text()}`)
    return new Set()
  }

  const data: SheetsResponse = await res.json()
  const rows = data.values ?? []
  const emails = rows.flatMap((row) => row).filter(Boolean)

  return new Set(emails.map((e) => e.toLowerCase().trim()))
}

export async function isEmailWhitelisted(email: string): Promise<boolean> {
  const emails = await fetchWhitelistedEmails()
  return emails.has(email.toLowerCase().trim())
}
