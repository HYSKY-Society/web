const WEBINARS_URL = 'https://www.hysky.org/free-webinars'
const WEEK_IN_SECONDS = 7 * 24 * 60 * 60

export async function getHyskyMonthlyFlyer(): Promise<{ src: string; alt: string } | null> {
  try {
    const response = await fetch(WEBINARS_URL, {
      next: { revalidate: WEEK_IN_SECONDS },
    })
    if (!response.ok) return null

    const html = await response.text()
    const images = html.match(/<img\b[^>]*>/gi) ?? []
    const flyer = images.find((image) => /\bid=["']img_comp-lz8l9zcu["']/i.test(image))
      ?? images.find((image) => /\balt=["']HYSKY Monthly #\d+\.jpg["']/i.test(image))
    const src = flyer?.match(/\bsrc=["']([^"']+)["']/i)?.[1]?.replace(/&amp;/g, '&')
    if (!src) return null

    const url = new URL(src)
    if (url.protocol !== 'https:' || url.hostname !== 'static.wixstatic.com' || !url.pathname.startsWith('/media/')) {
      return null
    }

    const alt = flyer?.match(/\balt=["']([^"']+)["']/i)?.[1] ?? 'Upcoming HySky Monthly webinar flyer'
    return { src: url.toString(), alt }
  } catch {
    return null
  }
}
