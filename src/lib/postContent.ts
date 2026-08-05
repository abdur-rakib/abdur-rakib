import sanitizeHtml from 'sanitize-html'

const ALLOWED_TAGS = [
  'p', 'a', 'strong', 'em', 'b', 'i', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'img', 'figure', 'figcaption',
  'hr', 'br', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'del', 'sub', 'sup',
]

/**
 * Sanitize a post body for safe on-site rendering. Both current sources
 * (Hashnode, Medium RSS) emit HTML, so the body is sanitized then rendered
 * verbatim rather than round-tripped through a markdown pipeline.
 */
export function sanitizePostContent(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ['href', 'title', 'target', 'rel'],
      img: ['src', 'alt', 'width', 'height', 'loading'],
      th: ['colspan', 'rowspan', 'align'],
      td: ['colspan', 'rowspan', 'align'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: (tagName, attribs) => {
        const href = attribs.href ?? ''
        const external = /^https?:/i.test(href)
        return {
          tagName: 'a',
          attribs: {
            ...attribs,
            ...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
          },
        }
      },
      img: (tagName, attribs) => ({
        tagName: 'img',
        attribs: { ...attribs, loading: 'lazy' },
      }),
    },
  })
}
