export type PreviewCompanyContact = {
  name: string
  title: string
}

export type PreviewCompany = {
  slug: string
  name: string
  initials: string
  category: string
  city: string
  state: string | null
  country: string
  website: string
  summary: string
  contacts: PreviewCompanyContact[]
}

// Fictional records used only to preview the company-directory experience.
export const previewCompanies: PreviewCompany[] = [
  {
    slug: 'aerofuture-labs',
    name: 'AeroFuture Labs',
    initials: 'AF',
    category: 'Aircraft Development',
    city: 'Seattle',
    state: 'Washington',
    country: 'United States',
    website: 'aerofuture.example.com',
    summary: 'Developing hydrogen-electric propulsion concepts for regional aircraft and advanced air mobility.',
    contacts: [
      { name: 'Avery Morgan', title: 'Director of Flight Programs' },
      { name: 'Jordan Lee', title: 'Hydrogen Systems Engineer' },
      { name: 'Taylor Brooks', title: 'Partnerships Lead' },
    ],
  },
  {
    slug: 'blue-horizon-aviation',
    name: 'Blue Horizon Aviation',
    initials: 'BH',
    category: 'Airline & Operations',
    city: 'Denver',
    state: 'Colorado',
    country: 'United States',
    website: 'bluehorizon.example.com',
    summary: 'Exploring low-emission fleet operations, airport readiness, and new energy infrastructure.',
    contacts: [
      { name: 'Morgan Chen', title: 'VP, Sustainability' },
      { name: 'Riley Patel', title: 'Fleet Strategy Manager' },
    ],
  },
  {
    slug: 'cleanwing-research',
    name: 'CleanWing Research',
    initials: 'CR',
    category: 'Research & Education',
    city: 'Toulouse',
    state: null,
    country: 'France',
    website: 'cleanwing.example.com',
    summary: 'Researching cryogenic storage, fuel-cell integration, and certification pathways for clean aviation.',
    contacts: [
      { name: 'Camille Laurent', title: 'Research Program Director' },
      { name: 'Alex Martin', title: 'Senior Researcher' },
    ],
  },
  {
    slug: 'hydrogen-flight-systems',
    name: 'Hydrogen Flight Systems',
    initials: 'HF',
    category: 'Hydrogen Technology',
    city: 'Hamburg',
    state: null,
    country: 'Germany',
    website: 'h2flightsystems.example.com',
    summary: 'Building modular hydrogen storage and fuel delivery systems designed for aviation applications.',
    contacts: [
      { name: 'Sam Keller', title: 'Chief Technology Officer' },
      { name: 'Jamie Fischer', title: 'Systems Integration Lead' },
      { name: 'Robin Weiss', title: 'Business Development' },
      { name: 'Casey Nguyen', title: 'Certification Specialist' },
    ],
  },
  {
    slug: 'skygrid-infrastructure',
    name: 'SkyGrid Infrastructure',
    initials: 'SI',
    category: 'Airport Infrastructure',
    city: 'Singapore',
    state: null,
    country: 'Singapore',
    website: 'skygrid.example.com',
    summary: 'Planning airport hydrogen supply, refueling, and ground-support infrastructure for future fleets.',
    contacts: [
      { name: 'Drew Tan', title: 'Infrastructure Programs Lead' },
    ],
  },
  {
    slug: 'voltair-mobility',
    name: 'VoltAir Mobility',
    initials: 'VM',
    category: 'Advanced Air Mobility',
    city: 'Montréal',
    state: 'Québec',
    country: 'Canada',
    website: 'voltair.example.com',
    summary: 'Designing battery-electric and hydrogen-electric aircraft for short-range passenger operations.',
    contacts: [
      { name: 'Quinn Roy', title: 'Founder & CEO' },
      { name: 'Emerson Silva', title: 'Aircraft Design Lead' },
    ],
  },
]

export function companyLocation(company: PreviewCompany) {
  return [company.city, company.state, company.country].filter(Boolean).join(', ')
}

export function getPreviewCompany(slug: string) {
  return previewCompanies.find((company) => company.slug === slug) ?? null
}
