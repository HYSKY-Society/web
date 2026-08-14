export type Instructor = {
  name: string
  role: string
  bio: string
}

export type OutlineSection = {
  title: string
  points: string[]
}

export type Lecture = {
  title: string
  videoUrl?: string
  slidesUrl?: string
  upcoming?: boolean
}

export type ReadingMaterial = {
  label: string
  url?: string
  children?: { label: string; url?: string }[]
}

export type Course = {
  slug: string
  title: string
  tagline: string
  image?: string
  imageAlt?: string
  externalLink?: string
  buyLink: string
  badge: string
  accent: string
  accentLight: string
  highlights: { icon: string; label: string; value: string }[]
  keyFeatures: string[]
  overview: string
  objectives: string[]
  audience: string[]
  fees: { label: string; price: string }[]
  outline: OutlineSection[]
  instructors: Instructor[]
  ceus: string
  lectures?: Lecture[]
  readingMaterials?: ReadingMaterial[]
}

export const courses: Course[] = [
  {
    slug: 'h2-aircraft-certification',
    title: 'H2 Aircraft Certification Course',
    tagline: 'The first comprehensive course dedicated to certification of hydrogen-powered aircraft — built for industry professionals and regulators.',
    image: '/courses/h2-aircraft-certification.jpg',
    imageAlt: 'H2 Aircraft Certification online short course featuring a hydrogen electric aircraft',
    buyLink: 'https://www.zeffy.com/en-US/ticketing/h2-aircraft-certification-course',
    badge: '✈️ Certification',
    accent: '#5d00f5',
    accentLight: '#9b6dff',
    highlights: [
      { icon: '⏱️', label: 'Duration', value: '3 Weeks' },
      { icon: '🎓', label: 'Classes', value: '6 Classes' },
      { icon: '🕐', label: 'Total Hours', value: '12 Hours' },
      { icon: '📜', label: 'Certificate', value: 'Included' },
    ],
    keyFeatures: [
      'Available on-demand — learn at your own pace',
      'First comprehensive course on hydrogen aircraft certification',
      'Certificate of Completion from HySky Society',
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
      { label: 'HySky Member Price', price: '$200 USD' },
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
        role: 'CEO & Founder, HySky Society',
        bio: 'Aerospace engineer and entrepreneur, Danielle founded HySky Society to decarbonize aviation with hydrogen. She created FLYING HY (the world\'s top hydrogen aviation event), the H2Hub Summit, and developed the industry\'s first short courses on hydrogen aircraft certification, working alongside regulators and industry leaders to bridge critical knowledge gaps.',
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
    tagline: 'The first comprehensive training program focused on the hazards, standards, systems, and emergency practices required for safe hydrogen aviation operations.',
    image: '/courses/h2-safety-for-aviation.jpg',
    imageAlt: 'Hydrogen Safety for Aviation online short course with blue hydrogen-themed artwork',
    buyLink: 'https://www.zeffy.com/en-US/ticketing/h2-safety-for-aviation-course',
    badge: '🛡️ Safety',
    accent: '#00D4D4',
    accentLight: '#67e8f9',
    highlights: [
      { icon: '⏱️', label: 'Duration', value: '3 Weeks' },
      { icon: '🎓', label: 'Classes', value: '6 Classes' },
      { icon: '🕐', label: 'Total Hours', value: '12 Hours' },
      { icon: '📜', label: 'Certificate', value: 'Included' },
    ],
    keyFeatures: [
      'Available on-demand — learn at your own pace',
      'Six complete lecture recordings with downloadable course slides',
      'Certificate of Completion from HySky Society',
      '12 classroom hours / 1.2 CEU / 12 PDH',
      'Built for aircraft, airport, fueling, and emergency-response teams',
    ],
    overview: `The H2 Safety for Aviation Short Course provides a complete foundation in the hazards, standards, system behaviors, and emergency practices required for safe hydrogen integration in aviation.

Developed by HySky Society, the curriculum covers hydrogen’s unique physical and chemical properties, codes and standards, detection and ventilation needs, materials and system design, storage and fueling safety, operational considerations, and emergency response strategies.

Students learn to assess and mitigate risks across LH₂, GH₂, fuel-cell systems, distribution networks, hangars, airports, and aircraft—supporting safe deployment of hydrogen-powered aviation.`,
    objectives: [
      'Explain hydrogen’s safety-related physical and chemical behavior',
      'Apply NFPA, ISO, SAE, ICAO, FAA, and EASA standards to hydrogen aviation systems',
      'Assess hazards associated with LH₂ and GH₂ storage, transfer, and distribution',
      'Evaluate detection, ventilation, electrical classification, and mitigation technologies',
      'Integrate hydrogen safety into aircraft, hangars, MRO facilities, fueling areas, and airport operations',
      'Develop emergency-response strategies for leaks, spills, fires, overpressure events, and system failures',
      'Understand future standards, R&D needs, and pathways to global policy alignment',
    ],
    audience: [
      'Anyone preparing for or interested in hydrogen aviation safety',
      'Aircraft developers and safety specialists',
      'Regulators working across FAA, EASA, ICAO, NFPA, and ISO frameworks',
      'Airport firefighters, emergency responders, and fueling operators',
      'Hydrogen producers, compliance and risk managers, and MRO professionals',
      'Engineers, pilots, and aviation leaders seeking hydrogen safety literacy',
    ],
    fees: [
      { label: 'Non-Member Price', price: '$500 USD' },
      { label: 'HySky Connect VIP Member Price', price: '$200 USD' },
      { label: 'Student Price', price: '$200 USD' },
    ],
    outline: [
      {
        title: 'Week 1 — Hydrogen Hazards, Standards & Codes',
        points: [
          'Lecture 1: Introduction to Hydrogen Hazards in Aviation',
          'Lecture 2: Standards and Codes for Hydrogen Safety',
          'NFPA, ISO, SAE, ICAO, FAA, and EASA frameworks',
        ],
      },
      {
        title: 'Week 2 — Flight Operations, Storage & Fueling',
        points: [
          'Lecture 3: Prototype Flight Operations: Safety, Risk & Readiness',
          'Lecture 4: LH₂ & GH₂ Storage, Fueling & Distribution Safety',
          'Boil-off management, transfer operations, readiness criteria, and safety gates',
        ],
      },
      {
        title: 'Week 3 — Aircraft, Airport & Emergency Safety',
        points: [
          'Lecture 5: Aircraft–Airport Hydrogen Safety Integration: Detection, Ventilation & Risk Controls',
          'Lecture 6: Aircraft Safety: Jet Fuel vs. Hydrogen',
          'Leak detection, ventilation, hazard mitigation, and operational risk controls',
        ],
      },
    ],
    lectures: [
      { title: 'Lecture 1: Introduction to Hydrogen Hazards in Aviation' },
      { title: 'Lecture 2: Standards and Codes for Hydrogen Safety' },
      { title: 'Lecture 3: Prototype Flight Operations: Safety, Risk & Readiness' },
      { title: 'Lecture 4: LH₂ & GH₂ Storage, Fueling & Distribution Safety' },
      { title: 'Lecture 5: Aircraft–Airport Hydrogen Safety Integration: Detection, Ventilation & Risk Controls' },
      { title: 'Lecture 6: Aircraft Safety: Jet Fuel vs. Hydrogen' },
    ],
    readingMaterials: [
      { label: 'Downloadable slide deck for every lecture (included with course access)' },
      { label: 'NFPA 2: Hydrogen Technologies Code' },
      { label: 'SAE J2601 hydrogen fueling protocols' },
      { label: 'CSA IR 3-18 hydrogen safety guidance' },
      { label: 'NASA prototype flight-test and operational safety references' },
    ],
    instructors: [
      {
        name: 'Danielle McLean',
        role: 'CEO & Founder, HySky Society',
        bio: 'Aerospace engineer and founder of HySky Society. Danielle leads the course introduction to hydrogen hazards and connects safety principles to real aviation systems and operations.',
      },
      {
        name: 'Rex Alexander',
        role: 'Hydrogen Codes & Standards Instructor',
        bio: 'Rex provides a practical roadmap to hydrogen safety codes and standards across production, storage, transport, refueling, airports, and aviation use cases.',
      },
      {
        name: 'Raffaele Russo',
        role: 'Prototype Flight Operations Instructor',
        bio: 'Raffaele teaches hazard identification, operational risk controls, readiness criteria, safety gates, and disciplined go/no-go decisions for early-stage hydrogen flight testing.',
      },
      {
        name: 'Cullen Hall',
        role: 'Hydrogen Infrastructure Safety Instructor',
        bio: 'Cullen covers liquid and gaseous hydrogen storage, safe transfer operations, boil-off management, loss prevention, and infrastructure tradeoffs for aviation deployment.',
      },
      {
        name: 'Chris McWhinney',
        role: 'Aircraft & Airport Safety Instructor',
        bio: 'Chris focuses on leak behavior, detection, ventilation, fitting integrity, asphyxiation risk, and scalable hazard-mitigation systems for aircraft and airport environments.',
      },
      {
        name: 'Jason Damazo',
        role: 'Aircraft Safety Instructor',
        bio: 'Jason examines the operational safety realities of hydrogen aircraft, comparing hazards and risk-management practices for conventional jet fuel and hydrogen systems.',
      },
    ],
    ceus: '12 classroom hours / 1.2 CEU / 12 PDH',
  },
  {
    slug: 'h2-aviation-policy',
    title: 'H2 Aviation Policy & Power',
    tagline: 'The first comprehensive course dedicated to federal policy strategy for hydrogen aviation — designed for industry leaders, regulators, and innovators shaping the future of zero-carbon flight.',
    image: '/courses/h2-aviation-policy-power.jpg',
    imageAlt: 'H2 Aviation Policy and Power online short course about making hydrogen aviation a federal priority',
    buyLink: 'https://www.zeffy.com/embed/ticketing/h2-aviation-policy-and-power',
    badge: '🏛️ Policy',
    accent: '#2563eb',
    accentLight: '#60a5fa',
    highlights: [
      { icon: '⏱️', label: 'Duration', value: '6 Weeks' },
      { icon: '🎓', label: 'Classes', value: '6 Classes' },
      { icon: '🕐', label: 'Total Hours', value: '12 Hours' },
      { icon: '📜', label: 'Certificate', value: 'Included' },
    ],
    keyFeatures: [
      'First comprehensive federal policy course for hydrogen aviation',
      'Certificate of Completion from HySky Society',
      '12 classroom hours / 1.2 CEU / 12 PDH',
      'Delivered live via Zoom on HySky Connect',
      'Sessions available on-demand within 1–2 days',
      'Instructor available by email between sessions',
    ],
    overview: `Hydrogen aviation will not scale on engineering alone. It requires federal alignment, funding architecture, regulatory coordination, and bipartisan strategy.

The Hydrogen Aviation Policy & Power Short Course provides a structured foundation in how U.S. federal systems prioritize emerging technologies — and how industry leaders can responsibly influence that process.

Developed by HySky Society, this course covers how appropriations are shaped, how agencies determine research priorities, how regulatory pathways evolve, and how coordinated industry action can move hydrogen aviation from the margins to a national priority.

Participants will gain clarity on the roles of NASA, FAA, DOE, DOT, DoD, and Congress, and will learn how to align technical progress with policy momentum.`,
    objectives: [
      'Explain how federal appropriations and budget cycles work',
      'Identify who controls funding and who controls regulation',
      'Understand the roles of NASA, FAA, DOE, DoD, and Congress',
      'Distinguish between lobbying and advocacy; what organizations are permitted to do',
      'Analyze how emerging sectors like AAM and UAS built federal momentum',
      'Evaluate when and why coordinated industry action is needed',
      'Make informed decisions about signing letters, joining coalitions, etc.',
      'Participate confidently in policy discussions within their organizations',
      'Position hydrogen aviation within national competitiveness and defense frameworks',
    ],
    audience: [
      'Anyone preparing for or interested in the federal policy landscape shaping H2 aviation',
      'Aircraft developers, propulsion companies, and aerospace executives',
      'Regulatory affairs professionals and government relations teams',
      'Leaders engaging with NASA, FAA, DOE, DoD, or Congress',
      'Hydrogen producers, infrastructure developers, and airport authorities',
      'Engineers and technical leaders seeking federal policy literacy',
      'Organizations considering participating in coordinated industry initiatives',
    ],
    fees: [
      { label: 'Non-Member Price', price: '$500 USD' },
      { label: 'HySky Connect VIP Member Price', price: '$200 USD' },
      { label: 'Student Price', price: '$200 USD' },
    ],
    outline: [],
    lectures: [
      {
        title: 'Lecture 1: What Is Public Policy? (And How It Actually Shapes Industries)',
        videoUrl: 'https://youtu.be/8KiEev5aPCs',
      },
      {
        title: 'Lecture 2: Understanding Policy Gaps in Hydrogen Aviation',
        videoUrl: 'https://youtu.be/dtKjB7VvKUc',
        slidesUrl: 'https://drive.google.com/file/d/1wxuBI50wPi7MNFmEnkbgRtyj8v8YBeg5/view?usp=sharing',
      },
      {
        title: 'Lecture 3: VFS Case Study & FAA Case Study',
        videoUrl: 'https://youtu.be/F9comieSTpU',
      },
      {
        title: 'Lecture 4: How and When to Engage with a Lobbying Firm',
        videoUrl: 'https://youtu.be/mCLtuY71FTk',
      },
      {
        title: 'Lecture 5: Capstone Launch: Contacting Your Members',
        videoUrl: 'https://youtu.be/MfxBoAFEkjA',
      },
      {
        title: 'Lecture 6: H2 Aviation Policy & Power',
        videoUrl: 'https://youtu.be/5yxZ1MPhhuk',
      },
    ],
    readingMaterials: [
      { label: 'Course Guidebook: Advocating for Hydrogen Aviation in the U.S.' },
      { label: 'Capstone Project' },
      { label: 'Updated FY27 House Approps Markup Schedule' },
      { label: 'Letter to NASA' },
      { label: 'The Letters' },
      { label: "NASA's Fiscal Year 2027 Budget Request" },
      { label: 'FAA Reauthorization Act of 2024' },
      { label: 'FAA Hydrogen-Fueled Aircraft Safety and Certification Roadmap 2024' },
      { label: 'FAA Hydrogen Aviation Working Group (HAWG)' },
      { label: 'NASA Reauthorization Act of 2026' },
      {
        label: 'White Paper: Evaluating readiness for hydrogen in the United States aviation industry from a policy lens',
      },
      {
        label: 'VFS Case Study — Mike Hirschberg',
        children: [
          { label: 'Future Vertical Lift Overview' },
          { label: 'JMR Technology Demonstration Update: The Road to Future Vertical Lift' },
          { label: 'Save NASA Science returns to Capitol Hill' },
        ],
      },
    ],
    instructors: [],
    ceus: '12 classroom hours / 1.2 CEU / 12 PDH',
  },
  {
    slug: 'advanced-sustainable-aviation-fuels-and-aircraft-design',
    title: 'Advanced Sustainable Aviation Fuels and Aircraft Design',
    tagline: 'A five-week joint AIAA and HySky Society course covering sustainable aviation fuels, hydrogen, hybrid-electric aircraft design, certification, safety, and airport infrastructure.',
    image: '/courses/saf-aircraft-design-course.jpg',
    imageAlt: 'AIAA and HySky Advanced Sustainable Aviation Fuels and Aircraft Design online short course',
    externalLink: 'https://aiaa.org/courses/advanced-sustainable-aviation-fuels-and-aircraft-design/',
    buyLink: 'https://aiaa.org/courses/advanced-sustainable-aviation-fuels-and-aircraft-design/',
    badge: '🌱 Sustainable Aviation',
    accent: '#5d00f5',
    accentLight: '#9b6dff',
    highlights: [
      { icon: '⏱️', label: 'Duration', value: '5 Weeks' },
      { icon: '🕐', label: 'Total Hours', value: '20 Hours' },
      { icon: '💻', label: 'Format', value: 'Online' },
      { icon: '📅', label: 'Dates', value: 'Sep 22 – Oct 22, 2026' },
    ],
    keyFeatures: [
      'Joint AIAA and HySky Society online short course',
      'Covers sustainable aviation fuels, hydrogen, and hybrid-electric aircraft design',
      'Includes certification, safety, and airport infrastructure',
      'Tuesdays and Thursdays, 1:00 – 3:00 PM ET',
    ],
    overview: 'This five-week online course connects sustainable aviation fuel strategy with practical aircraft design, certification, safety, hydrogen, hybrid-electric propulsion, and airport infrastructure considerations.',
    objectives: [],
    audience: [
      'Aerospace engineers and aircraft designers',
      'Sustainable aviation and propulsion professionals',
      'Certification, safety, and airport infrastructure specialists',
    ],
    fees: [
      { label: 'Registration', price: 'See AIAA course page' },
    ],
    outline: [],
    instructors: [],
    ceus: 'See AIAA course page',
  },
  {
    slug: 'advanced-hydrogen-aerospace-technologies-and-design',
    title: 'Advanced Hydrogen Aerospace Technologies and Design',
    tagline: 'A 20-hour on-demand AIAA and HySky Society course covering hydrogen fundamentals, fixed-wing and eVTOL design, and airport infrastructure.',
    image: '/courses/advanced-hydrogen-aerospace-technologies-design.jpg',
    imageAlt: 'Advanced hydrogen aerospace aircraft illuminated against a black background',
    externalLink: 'https://aiaa.mycrowdwisdom.com/diweb/catalog/item?id=14691996',
    buyLink: 'https://aiaa.mycrowdwisdom.com/diweb/catalog/item?id=14691996',
    badge: '⚡ Aerospace Technology',
    accent: '#00D4D4',
    accentLight: '#33ffff',
    highlights: [
      { icon: '▶️', label: 'Format', value: 'On Demand' },
      { icon: '🕐', label: 'Total Hours', value: '20 Hours' },
      { icon: '🧩', label: 'Topics', value: '4 Parts' },
      { icon: '📜', label: 'Certificate', value: 'AIAA Certificate' },
    ],
    keyFeatures: [
      'Joint AIAA and HySky Society on-demand short course',
      'Stream 20 hours of course recordings anytime',
      'Covers hydrogen and cryogenic fundamentals',
      'Explores fixed-wing, eVTOL, and airport infrastructure design',
      'AIAA Certificate of Completion included',
    ],
    overview: 'This on-demand short course presents hydrogen aerospace technology in the context of fixed-wing and eVTOL aircraft design. It covers hydrogen and cryogenic fundamentals, aircraft powertrain and integration decisions, infrastructure, airport compatibility, safety, and regulatory considerations.',
    objectives: [
      'Understand hydrogen and cryogenic fundamentals for aerospace applications',
      'Evaluate hydrogen powertrains for fixed-wing aircraft',
      'Explore hydrogen fuel-cell and hybrid-electric eVTOL design',
      'Understand airport compatibility and hydrogen infrastructure requirements',
    ],
    audience: [
      'Aerospace engineers interested in electric and hybrid-electric propulsion',
      'Electrical and mechanical engineers working with hydrogen propulsion systems',
      'Professionals developing zero-carbon VTOL aircraft, UAS, and launch vehicles',
    ],
    fees: [
      { label: 'AIAA Member Price', price: '$945 USD' },
      { label: 'Non-Member Price', price: '$1,145 USD' },
      { label: 'AIAA Student Member Price', price: '$495 USD' },
    ],
    outline: [
      { title: 'Hydrogen and Cryogenic Fundamentals', points: ['4 hours'] },
      { title: 'Hydrogen for Fixed-Wing Design', points: ['6 hours'] },
      { title: 'Hydrogen-Powered eVTOL Design', points: ['8 hours'] },
      { title: 'Airport Compatibility and Hydrogen Infrastructure', points: ['2 hours'] },
    ],
    instructors: [],
    ceus: '20 hours / AIAA Certificate of Completion',
  },
]

export function getCourse(slug: string): Course | undefined {
  return courses.find((c) => c.slug === slug)
}
