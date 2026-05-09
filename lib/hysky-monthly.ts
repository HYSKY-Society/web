function thirdMonday(year: number, month: number): Date {
  // month is 0-indexed
  const firstDay = new Date(Date.UTC(year, month, 1))
  const dow = firstDay.getUTCDay() // 0=Sun, 1=Mon
  const daysToFirstMonday = (1 - dow + 7) % 7
  const thirdMondayDate = 1 + daysToFirstMonday + 14
  return new Date(Date.UTC(year, month, thirdMondayDate, 18, 0, 0)) // 6 PM UTC default
}

export function getNextHyskyMonthly(): Date {
  const now = new Date()
  const y = now.getUTCFullYear()
  const m = now.getUTCMonth()
  const thisMonth = thirdMonday(y, m)
  if (thisMonth.getTime() > now.getTime()) return thisMonth
  const nextM = m === 11 ? 0 : m + 1
  const nextY = m === 11 ? y + 1 : y
  return thirdMonday(nextY, nextM)
}

export function formatSessionDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}
