import sanitizeHtml from 'sanitize-html'

const ALLOWED_TAGS = [
  'p', 'a', 'strong', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'img', 'figure', 'figcaption',
]

const PAYWALL_THRESHOLD = 500

export function sanitizeMediumContent(rawHtml: string): { html: string; isPaywalled: boolean } {
  const html = sanitizeHtml(rawHtml, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ['href'],
      img: ['src', 'alt', 'width', 'height'],
    },
    exclusiveFilter: (frame) =>
      frame.tag === 'img' && frame.attribs.width === '1' && frame.attribs.height === '1',
  })

  const textLength = html.replace(/<[^>]+>/g, '').trim().length
  return { html, isPaywalled: textLength < PAYWALL_THRESHOLD }
}
