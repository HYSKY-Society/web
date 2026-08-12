export type NewsImage = {
  src: string
  alt: string
  credit?: string
  sourceUrl?: string
  license?: string
  licenseUrl?: string
  caption?: string
  modified?: boolean
}

const NEWS_IMAGE_OVERRIDES: Record<string, NewsImage> = {
  'hydrogen-aviations-airport-problem-who-is-building-the-infrastructure': {
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Wasserstoff_Tankstelle_Stuttgart_Flughafen.jpg/1920px-Wasserstoff_Tankstelle_Stuttgart_Flughafen.jpg',
    alt: 'Hydrogen fueling station at Stuttgart Airport in Germany',
    credit: '5R-MFT / Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Wasserstoff_Tankstelle_Stuttgart_Flughafen.jpg',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    caption: 'Hydrogen fueling station at Stuttgart Airport.',
    modified: true,
  },
  'the-companies-quietly-writing-hydrogen-aviations-rulebook': {
    src: 'https://upload.wikimedia.org/wikipedia/commons/3/3b/HY4_2016-09-29_ueber_Flughafen_Stuttgart.jpg',
    alt: 'HY4 hydrogen fuel-cell aircraft flying over Stuttgart Airport',
    credit: 'DLR / Felix Oprean',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:HY4_2016-09-29_ueber_Flughafen_Stuttgart.jpg',
    license: 'CC BY 3.0 DE',
    licenseUrl: 'https://creativecommons.org/licenses/by/3.0/de/deed.en',
    caption: 'The HY4 hydrogen fuel-cell aircraft during its first flight over Stuttgart Airport.',
  },
}

export function getNewsImage(
  slug: string,
  coverImageUrl: string | null,
  imageAltText: string | null,
  title: string,
): NewsImage | undefined {
  return NEWS_IMAGE_OVERRIDES[slug] || (coverImageUrl
    ? { src: coverImageUrl, alt: imageAltText || title }
    : undefined)
}
