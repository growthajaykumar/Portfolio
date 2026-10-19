import site from '../content/site.json';

export default site;

const NAMED = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', mdash: '—', ndash: '–',
  rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', hellip: '…', middot: '·', minus: '−', copy: '©',
};

/** Decode HTML entities for places that need plain text (metadata, aria). */
export function decode(s = '') {
  return String(s)
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, n) => NAMED[n] ?? m);
}

/** Plain text of an HTML fragment. */
export const text = (s = '') => decode(String(s).replace(/<[^>]+>/g, ''));

/** Map the original page's <head> tags onto the Next.js metadata API, value for value. */
export function toMetadata(m) {
  const get = (k) => m.meta.find((x) => x.name === k || x.property === k)?.content;
  const d = (k) => (get(k) == null ? undefined : decode(get(k)));
  const image = get('og:image');
  return {
    title: { absolute: decode(m.title) },
    description: d('description'),
    keywords: d('keywords'),
    robots: get('robots'),
    authors: get('author') ? [{ name: d('author') }] : undefined,
    alternates: m.canonical ? { canonical: m.canonical } : undefined,
    openGraph: get('og:title') && {
      type: get('og:type'),
      siteName: d('og:site_name'),
      locale: get('og:locale'),
      url: get('og:url'),
      title: d('og:title'),
      description: d('og:description'),
      images: image ? [{ url: image, width: +get('og:image:width') || undefined, height: +get('og:image:height') || undefined, alt: d('og:image:alt') }] : undefined,
    },
    twitter: get('twitter:card') && {
      card: get('twitter:card'),
      title: d('twitter:title'),
      description: d('twitter:description'),
      images: get('twitter:image') ? [get('twitter:image')] : undefined,
    },
  };
}
