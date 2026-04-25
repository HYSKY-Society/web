export type Instructor = {
  name: string
  role: string
  bio: string
}

export type OutlineSection = {
  title: string
  points: string[]
}

export type Course = {
  slug: string
  title: string
  tagline: string
  buyLink: string
  highlights: { icon: string; label: string; value: string }[]
  keyFeatures: string[]
  overview: string
  objectives: string[]
  audience: string[]
  fees: { label: string; price: string }[]
  outline: OutlineSection[]
  instructors: Instructor[]
  ceus: string
}

export const courses: Course[] = [
  {
    slug: 'h2-aircraft-certification',
    title: 'H2 Aircraft Certification Course',
    tagline: 'The first comprehensive course dedicated to certification of hydrogen-powered aircraft — built for industry professionals and regulators.',
    buyLink: 'https://www.zeffy.com/en-US/ticketing/h2-aircraft-certification-course',
    highlights: [
      { icon: '⏱️', label: 'Duration', value: '3 Weeks' },
      { icon: '🎓', label: 'Classes', value: '6 Classes' },
      { icon: '🕐', label: 'Total Hours', value: '12 Hours' },
      { icon: '📜', label: 'Certificate', value: 'Included' },
    ],
    keyFeatures: [
      'Available on-demand — learn at your own pace',
      'First comprehensive course on hydrogen aircraft certification',
      'Certificate of Completion from HYSKY Society',
      '12 classroom hours / 1.2 CEU / 12 PDH',
    ],
    overview: `The Hydrogen Aircraft Certification Short Course provides a comprehensive foundation in the regulatory, technical, and operational pathways required for certifying hydrogen-powered aircraft. Covering propulsion, storage, safety, airworthiness, and policy, this program equips students to navigate certification frameworks across major global regulators including the FAA, EASA, and Transport Canada.

This training is essential for aircraft developers, compliance leads, regulators, airports, hydrogen producers, and anyone preparing for the future of zero-emission flight.`,
    objectives: [
      'Understand hydrogen aircraft certification foundations across FAA, EASA, and Transport Canada',
      'Assess certification requirements for electric and fuel cell propulsion systems',
      'Evaluate safety and compliance challenges in LH₂ storage and fuel systems',
      'Identify operational certification requirements including ground handling and MRO',
      'Apply continuous airworthiness and licensing principles to hydrogen aircraft',
      'Examine global standards and policy roadmaps for hydrogen aviation',
    ],
    audience: [
      'Aircraft developers and certification specialists',
      'Compliance and regulatory leads',
      'Regulators and policymakers (FAA, EASA, Transport Canada, etc.)',
      'Airports and infrastructure planners',
      'Hydrogen producers and refueling station operators',
      'Maintenance, repair, and overhaul (MRO) professionals',
      'Pilots, engineers, and managers seeking certification literacy',
      'Anyone preparing for zero-emission flight',
    ],
    fees: [
      { label: 'HYSKY Member Price', price: '$200 USD' },
      { label: 'Non-Member Price', price: '$500 USD' },
    ],
    outline: [
      {
        title: 'Intro to Regulations and Standards Developments (US Focus)',
        points: [
          'Basics of aircraft certification',
          'Current hydrogen standards developments',
          'FAA rules on powered-lift, LSA, and UAS',
          'Comparing FAA, EASA, and CAA approaches',
          'Role of SAE and EuroCAE in standards development',
        ],
      },
      {
        title: 'Certification of Electric and Fuel Cell Propulsion Systems',
        points: [
          'Why electric and fuel cell propulsion?',
          'Regulatory challenges and approaches',
          'FAA vs. EASA comparison',
          'Examples in fixed-wing and rotorcraft',
        ],
      },
      {
        title: 'Certification Foundations and Regulatory Framework (Canadian Focus)',
        points: [
          'Airworthiness overview — history and purpose',
          'Type vs. product certification',
          'Canadian regulatory structure: Aeronautics Act, CARs, AWM',
          'Foreign validation and bilaterals',
          'Applying the framework to hydrogen systems',
        ],
      },
      {
        title: 'Introduction to Hydrogen Storage and Fuel Supply on Aircraft',
        points: [
          'Hydrogen storage and fuel supply (gas and liquid)',
          'Design parameters and failure modes',
          'FAA/EASA/CAA regulations on hydrogen storage',
        ],
      },
      {
        title: 'Ground Handling and Operational Certification',
        points: [
          'Hydrogen aircraft ground handling safety',
          'Fueling infrastructure and operational requirements',
          'Certification pathways and regulatory standards',
          'Staff training and competence requirements',
        ],
      },
      {
        title: 'Continuing Airworthiness, MRO, and Licensing',
        points: [
          'Continuous airworthiness for hydrogen propulsion',
          'Hydrogen-specific hazards and infrastructure',
          'MRO strategies for hydrogen systems',
          'Training and upskilling for personnel',
        ],
      },
      {
        title: 'Standardization and Future Policy Directions',
        points: [
          'Role of standardization in hydrogen aviation',
          'Key international organizations and regulators',
          'Policy influence on adoption and certification',
          'Harmonizing global standards',
          'Contribution to decarbonization goals',
        ],
      },
    ],
    instructors: [
      {
        name: 'Danielle McLean',
        role: 'CEO & Founder, HYSKY Society',
        bio: 'Aerospace engineer and entrepreneur, Danielle founded HYSKY Society to decarbonize aviation with hydrogen. She created FLYING HY (the world\'s top hydrogen aviation event), the H2Hub Summit, and developed the industry\'s first short courses on hydrogen aircraft certification, working alongside regulators and industry leaders to bridge critical knowledge gaps.',
      },
      {
        name: 'Mike Hirschberg',
        role: 'Principal, H2 Advisors LLC | Executive Director Emeritus, Vertical Flight Society',
        bio: 'One of the world\'s foremost authorities on eVTOL and hydrogen aviation, Mike launched the first public eVTOL conference in 2014, founded the VFS H2eVTOL Council, and co-founded SAE\'s AE-5H Hydrogen Aviation Committee. He has advised NASA, FAA, DARPA, and the Pentagon, and authored "Hydrogen is a Game Changer for Vertical Flight" (Forbes, 2024).',
      },
      {
        name: 'Dr. Sayem Zafar',
        role: 'Hydrogen & PEM Fuel Cell Propulsion Expert',
        bio: 'With 14+ years designing hydrogen fuel cell powertrains for fixed-wing UAVs, eVTOLs, and multi-rotor drones, Dr. Zafar holds a Ph.D. and has published over 20 peer-reviewed papers. His work spans hybrid solar-hydrogen UAV platforms and next-generation propulsion systems shaping the future of clean aviation.',
      },
      {
        name: 'Adam A. Bakos, P.Eng, PMP',
        role: 'Project Certification Manager, Transport Canada Civil Aviation',
        bio: 'A Professional Engineer with 15 years in aerospace, Adam specializes in airworthiness procedures, aircraft type certification, and international regulatory affairs. He holds aerospace engineering degrees from Toronto Metropolitan University, his P.Eng (2014), PMP (2016), and is a Member of the Royal Aeronautical Society. He also lectures on Aircraft Type Certification at TMU.',
      },
      {
        name: 'Bill Spellane',
        role: 'CEO, StarCube | Former COO, Alaka\'i Technologies',
        bio: 'Bill helped lead development of SKAI, a hydrogen-powered eVTOL designed for 400+ miles of range using liquid hydrogen fuel cells. At Alaka\'i, he oversaw flight testing, system integration, and early certification strategies, and continues to shape industry understanding of how hydrogen-electric propulsion systems can be certified and commercialized.',
      },
      {
        name: 'Dr. Eva Maleviti',
        role: 'Assistant Professor, Embry-Riddle Aeronautical University',
        bio: 'Program Coordinator of the MSc in Aviation & Aerospace Sustainability at ERAU, with 14+ years of academic experience. A technical expert for ICAO\'s CORSIA scheme, IRCA-certified Lead Auditor, licensed pilot and UAS operator, and Member of the Royal Aeronautical Society. Author of two books on sustainable aviation and 15+ journal papers.',
      },
    ],
    ceus: '12 classroom hours / 1.2 CEU / 12 PDH',
  },
  {
    slug: 'h2-safety-for-aviation',
    title: 'H2 Safety for Aviation',
    tagline: 'Essential safety protocols and best practices for hydrogen aviation operations.',
    buyLink: '#',
    highlights: [
      { icon: '⏱️', label: 'Duration', value: 'TBD' },
      { icon: '📡', label: 'Format', value: 'Online' },
      { icon: '🎓', label: 'Level', value: 'All levels' },
      { icon: '📜', label: 'Certificate', value: 'Included' },
    ],
    keyFeatures: [
      'Coming soon — details to be announced',
    ],
    overview: 'Full course details coming soon. Check back for updates.',
    objectives: [],
    audience: [],
    fees: [
      { label: 'HYSKY Member Price', price: 'TBD' },
      { label: 'Non-Member Price', price: 'TBD' },
    ],
    outline: [],
    instructors: [],
    ceus: 'TBD',
  },
]

export function getCourse(slug: string): Course | undefined {
  return courses.find((c) => c.slug === slug)
}
