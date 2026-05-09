import 'dotenv/config'
import { db } from '../lib/db'
import { pressPosts } from '../lib/schema'

const posts = [
  {
    slug: 'accessing-online-hydrogen-fueling-resources',
    title: 'Accessing Online Hydrogen Fueling Resources: Your Gateway to the Future of Aviation',
    author: 'HYSKY Society',
    excerpt: 'Imagine a world where aircraft glide silently through the sky, powered by clean, abundant hydrogen. This isn\'t just a dream anymore — it\'s rapidly becoming reality. But how do we, as developers, regulators, and leaders in aviation and propulsion, tap into the wealth of knowledge and resources needed to make hydrogen aviation safe, efficient, and scalable? The answer lies in accessing online hydrogen fueling resources — a treasure trove of information, tools, and networks designed to accelerate the transition.',
    readTimeMinutes: 4,
    publishedAt: new Date('2026-04-22'),
  },
  {
    slug: 'how-airports-will-fuel-the-future',
    title: 'How Airports Will Fuel the Future: Why Hydrogen Hubs — Not Trucks — Are the Smart Bet for Sustainable Aviation',
    author: 'HYSKY Society',
    excerpt: 'As aviation decarbonization moves from buzzword to business imperative, a pragmatic blueprint is emerging: centralized hydrogen hubs feeding airports via short pipelines. In a recent industry discussion, Dr. Phillip Ansell outlined the operational realities that make distributed truck delivery and long-haul liquid shipping increasingly impractical for high-volume airport needs — and why strategically sited hydrogen hubs offer a far better path forward.',
    readTimeMinutes: 2,
    publishedAt: new Date('2026-04-22'),
  },
  {
    slug: 'aiaa-dr-ashira-beutler-greene-hydrogen-aviation-policy',
    title: 'AIAA\'s Dr. Ashira Beutler-Greene and Illinois Experts Dr. Phillip Ansell and Elias Waddington Lecture on Hydrogen Aviation Policy',
    author: 'HYSKY Society',
    excerpt: 'HYSKY Society announces Dr. Ashira Beutler-Greene (AIAA), Dr. Phillip Ansell (University of Illinois), and Elias Waddington (University of Illinois) leading a featured lecture: "Understanding Policy Gaps in Hydrogen Aviation (and What to Do About Them)" — scheduled April 21 as part of the H2 Aviation Policy & Power cohort launching April 14, 2026.',
    readTimeMinutes: 2,
    publishedAt: new Date('2026-04-07'),
  },
  {
    slug: 'jamie-panarites-mike-barbera-acg-advocacy',
    title: 'Jamie Panarites and Mike Barbera of ACG Advocacy as Instructors for Hydrogen Aviation Policy & Power Cohort',
    author: 'HYSKY Society',
    excerpt: 'HYSKY Society is proud to announce that Jamie Panarites, Director of Policy at ACG Advocacy, and Mike Barbera, Senior Partner at ACG Advocacy, will serve as instructors for the H2 Aviation Policy & Power cohort launching April 14, 2026. They bring federal policy, appropriations, and legislative strategy experience focused on preparing participants for direct government engagement.',
    readTimeMinutes: 2,
    publishedAt: new Date('2026-04-07'),
  },
  {
    slug: 'todd-solomon-zeroavia-hydrogen-aviation-policy-cohort',
    title: 'Todd Solomon, ZeroAvia\'s Former Head of Government Affairs, to Lecture in HYSKY\'s Hydrogen Aviation Policy & Power Cohort',
    author: 'HYSKY Society',
    excerpt: 'Todd Solomon — former Head of Government Affairs for ZeroAvia, Principal & Managing Director of Capitol Suasion — helped secure hydrogen\'s inclusion in the FAA Reauthorization Act of 2024, where hydrogen is referenced 52 times. He has been announced as an instructor for the H2 Aviation Policy & Power cohort launching April 14, 2026.',
    readTimeMinutes: 2,
    publishedAt: new Date('2026-04-04'),
  },
  {
    slug: 'virtual-easter-egg-hunt-flying-hy-secrets',
    title: 'Virtual Easter Egg Hunt: Find Eggs to Unveil FLYING HY Secrets Inside!',
    author: 'Bianca Mora',
    excerpt: 'Happy Easter from HYSKY Society! We\'re celebrating spring with a virtual Easter egg hunt. Find the hidden eggs across our platforms to unveil exclusive FLYING HY 2026 announcements and surprises.',
    readTimeMinutes: 1,
    publishedAt: new Date('2026-04-03'),
  },
  {
    slug: 'hysky-partners-evtol-insights-naamce',
    title: 'HYSKY Partners with eVTOL Insights to Bring Hydrogen Aviation to NAAMCE in Ohio',
    author: 'HYSKY Society',
    excerpt: 'HYSKY Society and eVTOL Insights are partnering for a dedicated Hydrogen Aviation Panel at the North America Conference & Awards 2026 (NAAMCE), April 29 – May 1, 2026, at the National Advanced Air Mobility Center of Excellence in Springfield, Ohio.',
    readTimeMinutes: 2,
    publishedAt: new Date('2026-03-31'),
  },
  {
    slug: 'university-illinois-phil-ansell-hydrogen-aviation-blueprint',
    title: 'University of Illinois\' Phil Ansell Delivers Hydrogen Aviation Blueprint for 2050',
    author: 'HYSKY Society',
    excerpt: 'Hydrogen aircraft could make up about 25 percent of the global fleet, with entry into service expected in the late 2030s to early 2040s. Dr. Phillip Ansell of the University of Illinois outlines the technical and infrastructure roadmap required to reach this goal, with the global fleet potentially growing to nearly 60,000 aircraft.',
    readTimeMinutes: 5,
    publishedAt: new Date('2026-03-24'),
  },
  {
    slug: 'hydrogen-powered-drone-shenyang-outperforms-lithium',
    title: 'Revolutionizing Flight: How a Hydrogen-Powered Drone from Shenyang Outperforms Lithium Battery Models',
    author: 'HYSKY Society',
    excerpt: 'Wang Jiefan, hydrogen power engineer at Shenyang Shengke Hangyu, explains that the hydrogen-powered drone "operates reliably where lithium batteries fail, opening new possibilities for industrial applications." The Shenyang drone demonstrates extended range, faster refueling, and superior cold-weather performance compared to lithium battery equivalents.',
    readTimeMinutes: 3,
    publishedAt: new Date('2026-03-23'),
  },
]

async function main() {
  console.log('Seeding press posts...')
  for (const post of posts) {
    try {
      await db.insert(pressPosts).values({ ...post, isPublished: true }).onConflictDoNothing()
      console.log(`  ✓ ${post.title.substring(0, 60)}...`)
    } catch (e) {
      console.error(`  ✗ ${post.slug}:`, e)
    }
  }
  console.log('Done.')
  process.exit(0)
}

main()
