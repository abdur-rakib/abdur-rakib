import { describe, expect, it } from 'vitest'
import { sanitizeMediumContent } from './mediumSanitize'

describe('sanitizeMediumContent', () => {
  it('strips disallowed tags like script', () => {
    const { html } = sanitizeMediumContent('<p>Hello</p><script>alert(1)</script>')
    expect(html).toBe('<p>Hello</p>')
  })

  it('strips 1x1 tracking pixel images', () => {
    const { html } = sanitizeMediumContent(
      '<p>Body</p><img src="https://track.example/pixel.gif" width="1" height="1" />'
    )
    expect(html).not.toContain('track.example')
  })

  it('keeps normal images', () => {
    const { html } = sanitizeMediumContent(
      '<p>Body</p><img src="https://miro.medium.com/photo.png" width="800" height="400" />'
    )
    expect(html).toContain('miro.medium.com/photo.png')
  })

  it('flags isPaywalled true when content is under 500 characters', () => {
    const { isPaywalled } = sanitizeMediumContent('<p>Short teaser paragraph only.</p>')
    expect(isPaywalled).toBe(true)
  })

  it('flags isPaywalled false when content is 500 characters or longer', () => {
    const longParagraph = `<p>${'word '.repeat(120)}</p>`
    const { isPaywalled } = sanitizeMediumContent(longParagraph)
    expect(isPaywalled).toBe(false)
  })
})
