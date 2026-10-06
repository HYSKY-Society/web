export function isValidTimeZone(timeZone: string): boolean {
  if (typeof timeZone !== 'string' || !timeZone.trim() || timeZone.length > 100) return false
  try {
    new Intl.DateTimeFormat('en-US', { timeZone })
    return true
  } catch {
    return false
  }
}

function partsInTimeZone(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).formatToParts(date)
  return Object.fromEntries(parts.map((part) => [part.type, part.value]))
}

export function toDateTimeLocal(iso: string, timeZone: string): string {
  const parts = partsInTimeZone(new Date(iso), timeZone)
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`
}

// A datetime-local value has no offset. Resolve it in the selected time zone
// and reject times skipped by a daylight-saving transition.
export function fromDateTimeLocal(local: string, timeZone: string): Date | null {
  if (!isValidTimeZone(timeZone)) return null
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(local)
  if (!match) return null
  const [, year, month, day, hour, minute] = match.map(Number)
  const wallTime = Date.UTC(year, month - 1, day, hour, minute)
  const expected = `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}`
  const offsets = new Set<number>()
  for (const sample of [wallTime - 86400000, wallTime, wallTime + 86400000]) {
    const parts = partsInTimeZone(new Date(sample), timeZone)
    offsets.add(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute), Number(parts.second)) - sample)
  }
  const matches = [...offsets]
    .map((offset) => new Date(wallTime - offset))
    .filter((candidate) => toDateTimeLocal(candidate.toISOString(), timeZone) === expected)
    .sort((a, b) => a.getTime() - b.getTime())
  return matches[0] ?? null
}
