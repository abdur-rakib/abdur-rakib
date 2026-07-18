import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Hero } from './Hero'
import { site } from '@/config/site'

describe('Hero', () => {
  it('renders name, role, location, and bio', () => {
    render(<Hero />)
    expect(screen.getByRole('heading', { level: 1, name: site.name })).toBeTruthy()
    expect(screen.getByText(site.role)).toBeTruthy()
    expect(screen.getByText(site.location)).toBeTruthy()
    const expectedBio = site.bio.replace('bKash', 'bKash Limited')
    expect(screen.getByText((_, el) => el?.textContent === expectedBio)).toBeTruthy()
  })

  it('bolds bKash within the bio', () => {
    render(<Hero />)
    const strong = screen.getByText('bKash Limited')
    expect(strong.tagName).toBe('STRONG')
  })

  it('renders a CTA link to /blog', () => {
    render(<Hero />)
    expect(screen.getByRole('link', { name: /read the blog/i }).getAttribute('href')).toBe('/blog')
  })

  it('opens the resume PDF directly in a new tab', () => {
    render(<Hero />)
    const link = screen.getByRole('link', { name: /view resume/i })
    expect(link.getAttribute('href')).toBe('/resume.pdf')
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
  })

  it('renders a link for every social plus email', () => {
    render(<Hero />)
    expect(screen.getByRole('link', { name: 'GitHub' }).getAttribute('href')).toBe(site.socials.github)
    expect(screen.getByRole('link', { name: 'Email' }).getAttribute('href')).toBe(`mailto:${site.email}`)
  })
})
