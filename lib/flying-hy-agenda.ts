export type FlyingHyAgendaItem = {
  time: string
  name: string
  title: string
  company: string
  presentationTitle?: string
  bio?: string
}

type Speaker = Omit<FlyingHyAgendaItem, 'time'>

const SPEAKER_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/1h_ZcF5jPoRNDhNiiveDRsDWDuMaPKpmU2Fm5YZl-czM/gviz/tq?tqx=out:csv&sheet=Sheet1'

const AGENDA_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/1quXmUEdkda0PgTHB1vy7J0P_4nHvaSTf3zquNM1hkmM/gviz/tq?tqx=out:csv&sheet=Agenda%20Final%20Draft'

// This snapshot keeps the public agenda available if Google is briefly unavailable.
// The live sheet replaces it whenever its public CSV endpoint can be read.
const FALLBACK_SPEAKERS: Speaker[] = [
  { name: 'Danielle McLean', title: 'CEO & Founder', company: 'HySky Society' },
  { name: 'Catherine (Cat) Wren & Jamie Santiago Muñoz', title: 'Co-Founders', company: 'Holding Pattern Co.' },
  { name: 'Christine Ourmières-Widener', title: 'Acting CEO & Board Member', company: 'ZeroAvia' },
  { name: 'Dr. Phil Elliott', title: 'Research and Development Manager', company: 'Moog Aircraft Group' },
  { name: 'Helen Leadbetter', title: 'Zero Emissions Flight Lead', company: 'UK Civil Aviation Authority' },
  { name: 'Irwin Kerboriou', title: 'Lead H2 Airport Operations Manager', company: 'Beyond Aero' },
  { name: 'Dr. Josef Kallo', title: 'Founder & CTO', company: 'H2FLY' },
  { name: 'Karl Samuelsson', title: 'Technical Business Development Director', company: 'Powercell Group' },
  { name: 'Dr. Eva Maleviti', title: 'Asst. Prof./Program Coordinator Aviation & Aerospace Sustainability', company: 'Embry-Riddle Aeronautical University' },
  { name: 'Jared Semik', title: 'Founder & CEO', company: 'Eternium Aerospace' },
  { name: 'Chase Carver', title: 'Technology Leader', company: 'GE Aerospace' },
  { name: 'Joshua Heyne', title: 'Director of the Bioproducts, Sciences, and Engineering Lab', company: 'Washington State University Tri-Cities' },
  { name: 'Mark van Wyk', title: 'Founder & CEO', company: 'FlyH2' },
  { name: 'Martin Chan', title: 'Senior Hydrogen Engineer', company: 'Joby Aviation' },
  { name: 'Mikael Cardinal', title: 'VP of Program Management – Organ Delivery Systems', company: 'Unither Bioelectronics' },
  { name: 'Chris McWhinney', title: 'Founder & CEO', company: 'Millennium Reign Energy' },
  { name: 'Bentzion Levinson', title: 'Founder & CEO', company: 'Heven Aerotech' },
  { name: 'Dr. Anita Sengupta', title: 'Founder & CEO', company: 'Hydroplane' },
  { name: 'Matt Moran', title: 'SP SME', company: 'Sierra Lobo' },
  { name: 'Tsion Abreha', title: 'Intern & HySky Monthly Lead', company: 'HySky Society' },
  { name: 'Dr. Jason Damazo', title: 'Physicist', company: 'Boeing' },
  { name: 'Paul Gloyer', title: 'President', company: 'Gloyer-Taylor Laboratories (GTL)' },
  { name: 'Barry Prince', title: 'Vice President, Hydrogen', company: 'FABRUM' },
  { name: 'Dr. Ben Emerson', title: 'Assistant Professor', company: 'Guggenheim School of Aerospace Engineering, Georgia Tech' },
  { name: 'Catalin Fotache', title: 'Chief Scientist & Technical Advisor (SES), Propulsion Systems', company: 'Federal Aviation Administration' },
  { name: 'Dr. Nick Ingarra', title: 'Founder', company: 'Ingarra Engineering' },
  { name: 'Serge Markoff', title: 'Founder & CEO', company: 'Sea Cheetah' },
  { name: 'John Piasecki', title: 'President & CEO', company: 'Piasecki Aircraft Corporation' },
  { name: 'Dr. Jacob Leachman', title: 'Professor of Mechanical Engineering and HYPER Center Director', company: 'Washington State University' },
  { name: 'Dr. Philip Stuckey', title: 'Founder & CEO', company: 'FC Renew' },
  { name: 'Sara Mitran', title: 'CEO', company: 'Nathe Management Consulting' },
]

const FALLBACK_TIMES: Array<{ name: string; time: string }> = [
  { name: 'Danielle McLean', time: '8:00 AM – 8:05 AM' },
  { name: 'Catherine Wren Jamie Santiago Muñoz', time: '8:05 AM – 8:25 AM' },
  { name: 'Christine Ourmières-Widener', time: '8:25 AM – 8:45 AM' },
  { name: 'Phil Elliott', time: '8:45 AM – 9:05 AM' },
  { name: 'Helen Leadbetter', time: '9:05 AM – 9:25 AM' },
  { name: 'Irwin Kerboriou', time: '9:25 AM – 9:45 AM' },
  { name: 'Josef Kallo', time: '9:45 AM – 10:05 AM' },
  { name: 'Karl Samuelsson', time: '10:05 AM – 10:25 AM' },
  { name: 'Eva Maleviti', time: '10:25 AM – 10:45 AM' },
  { name: 'Jared Semik', time: '10:45 AM – 11:05 AM' },
  { name: 'Chase Carver', time: '11:05 AM – 11:25 AM' },
  { name: 'Joshua Heyne', time: '11:25 AM – 11:45 AM' },
  { name: 'Mark van Wyk', time: '11:45 AM – 12:05 PM' },
  { name: 'Martin Chan', time: '12:05 PM – 12:25 PM' },
  { name: 'Mikael Cardinal', time: '12:25 PM – 12:45 PM' },
  { name: 'Chris McWhinney', time: '12:45 PM – 1:05 PM' },
  { name: 'Bentzion Levinson', time: '1:05 PM – 1:25 PM' },
  { name: 'Anita Sengupta', time: '1:25 PM – 1:45 PM' },
  { name: 'Matt Moran', time: '1:45 PM – 2:05 PM' },
  { name: 'Tsion Abreha', time: '2:05 PM – 2:25 PM' },
  { name: 'Jason Damazo', time: '2:25 PM – 2:45 PM' },
  { name: 'Paul Gloyer', time: '2:45 PM – 3:05 PM' },
  { name: 'Barry Prince', time: '3:05 PM – 3:25 PM' },
  { name: 'Ben Emerson', time: '3:25 PM – 3:45 PM' },
  { name: 'Catalin Fotache', time: '3:45 PM – 4:05 PM' },
  { name: 'Serge Markoff', time: '4:05 PM – 4:25 PM' },
  { name: 'Nick Ingarra', time: '4:25 PM – 4:45 PM' },
  { name: 'John Piasecki', time: '4:45 PM – 5:05 PM' },
  { name: 'Jacob Leachman', time: '5:05 PM – 5:25 PM' },
  { name: 'Philip Stuckey', time: '5:25 PM – 5:45 PM' },
  { name: 'Sara Mitran', time: '5:45 PM – 6:05 PM' },
]

function parseCsv(csv: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let value = ''
  let quoted = false

  for (let i = 0; i < csv.length; i += 1) {
    const char = csv[i]
    const next = csv[i + 1]

    if (char === '"' && quoted && next === '"') {
      value += '"'
      i += 1
    } else if (char === '"') {
      quoted = !quoted
    } else if (char === ',' && !quoted) {
      row.push(value.trim())
      value = ''
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') i += 1
      row.push(value.trim())
      if (row.some(Boolean)) rows.push(row)
      row = []
      value = ''
    } else {
      value += char
    }
  }

  row.push(value.trim())
  if (row.some(Boolean)) rows.push(row)
  return rows
}

function normalize(value: string): string[] {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\b(dr|prof|professor|keynote|reg|ac)\b/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(token => token.length > 1)
}

function matchScore(agendaName: string, speakerName: string): number {
  const agendaTokens = new Set(normalize(agendaName))
  return normalize(speakerName).reduce(
    (score, token) => score + (agendaTokens.has(token) ? 1 : 0),
    0,
  )
}

const SPEAKER_REPLACEMENTS: Record<string, string> = {
  'Michael Bluy': 'Chase Carver',
}

async function fetchCsv(url: string): Promise<string[][]> {
  const response = await fetch(url, { cache: 'no-store' })
  if (!response.ok) throw new Error(`Google Sheet returned ${response.status}`)
  return parseCsv(await response.text())
}

function speakersFromRows(rows: string[][]): Speaker[] {
  const [header, ...data] = rows
  const nameIndex = header?.findIndex(cell => cell.trim().toLowerCase() === 'name') ?? -1
  const titleIndex = header?.findIndex(cell => cell.trim().toLowerCase() === 'title') ?? -1
  const companyIndex = header?.findIndex(cell => cell.trim().toLowerCase() === 'company') ?? -1
  const presentationTitleIndex = header?.findIndex(cell => {
    const value = cell.trim().toLowerCase()
    return value === 'presentation title' || value === 'session title' || value === 'presentation'
  }) ?? -1
  const bioIndex = header?.findIndex(cell => {
    const value = cell.trim().toLowerCase()
    return value === 'bio' || value === 'biography' || value === 'speaker bio'
  }) ?? -1

  if (nameIndex < 0 || titleIndex < 0 || companyIndex < 0) return []

  return data
    .map(row => ({
      name: row[nameIndex]?.trim() ?? '',
      title: row[titleIndex]?.trim() ?? '',
      company: (row[companyIndex]?.trim() ?? '').replace(/^HYSKY Society$/i, 'HySky Society'),
      presentationTitle: presentationTitleIndex >= 0 ? row[presentationTitleIndex]?.trim() || undefined : undefined,
      bio: bioIndex >= 0 ? row[bioIndex]?.trim() || undefined : undefined,
    }))
    .filter(speaker => speaker.name && speaker.title && speaker.company)
}

function timesFromRows(rows: string[][]): Array<{ name: string; time: string }> {
  const [header, ...data] = rows
  const nameIndex = header?.findIndex(cell => cell.trim().toLowerCase() === 'speaker') ?? -1
  const timeIndex = header?.findIndex(cell => cell.trim().toLowerCase().includes('time')) ?? -1

  if (nameIndex < 0 || timeIndex < 0) return []

  return data
    .map(row => ({ name: row[nameIndex]?.trim() ?? '', time: row[timeIndex]?.trim() ?? '' }))
    .filter(item => item.name && item.time)
}

export async function getFlyingHyAgenda(): Promise<FlyingHyAgendaItem[]> {
  const [speakerRows, timeRows] = await Promise.all([
    fetchCsv(SPEAKER_SHEET_URL).catch(() => []),
    fetchCsv(AGENDA_SHEET_URL).catch(() => []),
  ])

  const speakers = speakersFromRows(speakerRows)
  const times = timesFromRows(timeRows)
  const trustedSpeakers = speakers.length ? speakers : FALLBACK_SPEAKERS
  const trustedTimes = times.length ? times : FALLBACK_TIMES
  const unusedSpeakers = new Set(trustedSpeakers.map((_, index) => index))

  return trustedTimes.flatMap(({ name, time }) => {
    let bestIndex = -1
    let bestScore = 0

    for (const index of unusedSpeakers) {
      const score = matchScore(SPEAKER_REPLACEMENTS[name] ?? name, trustedSpeakers[index].name)
      if (score > bestScore) {
        bestIndex = index
        bestScore = score
      }
    }

    if (bestIndex < 0 || bestScore < 1) return []
    unusedSpeakers.delete(bestIndex)
    return [{ time, ...trustedSpeakers[bestIndex] }]
  })
}

