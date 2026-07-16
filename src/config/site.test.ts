import { describe, expect, it } from 'vitest'
import { site } from './site'

describe('site config', () => {
  it('has all required social links as non-empty strings', () => {
    expect(site.socials.github).toMatch(/^https:\/\//)
    expect(site.socials.linkedin).toMatch(/^https:\/\//)
    expect(site.socials.medium).toMatch(/^https:\/\//)
  })

  it('has a name, role, location, bio, and email', () => {
    expect(site.name).toBe('Abdur Rakib')
    expect(site.role.length).toBeGreaterThan(0)
    expect(site.location).toBe('Dhaka, Bangladesh')
    expect(site.bio.length).toBeGreaterThan(0)
    expect(site.email).toBe('abdurrakib961@gmail.com')
  })
})
