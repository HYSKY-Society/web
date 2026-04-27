type SheetsResponse = {
  values?: string[][]
}

export async function fetchCourseEnrollees(tab: string): Promise<Set<string>> {
  const sheetId = process.env.GOOGLE_SHEET_ID
  const apiKey = process.env.GOOGLE_SHEETS_API_KEY

  if (!sheetId || !apiKey) {
    console.error('[course-access] GOOGLE_SHEET_ID or GOOGLE_SHEETS_API_KEY is not set')
    return new Set()
  }

  const range = `${tab}!A2:A1000`
  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/` +
    `${encodeURIComponent(range)}?key=${apiKey}`

  let res: Response
  try {
    res = await fetch(url, { next: { revalidate: 0 } })
  } catch (err) {
    console.error('[course-access] Network error fetching sheet:', err)
    return new Set()
  }

  if (!res.ok) {
    console.error(`[course-access] Sheets API returned ${res.status}: ${await res.text()}`)
    return new Set()
  }

  const data: SheetsResponse = await res.json()
  const rows = data.values ?? []
  return new Set(
    rows.flatMap((row) => row).filter(Boolean).map((e) => e.toLowerCase().trim())
  )
}

export async function hasCourseAccess(email: string, tab: string): Promise<boolean> {
  const enrollees = await fetchCourseEnrollees(tab)
  return enrollees.has(email.toLowerCase().trim())
}
