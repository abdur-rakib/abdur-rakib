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
    expect(screen.getByText(site.bio)).toBeTruthy()
  })

  it('renders CTA links to /blog and /resume', () => {
    render(<Hero />)
    expect(screen.getByRole('link', { name: /read the blog/i }).getAttribute('href')).toBe('/blog')
    expect(screen.getByRole('link', { name: /view résumé/i }).getAttribute('href')).toBe('/resume')
  })

  it('renders a link for every social plus email', () => {
    render(<Hero />)
    expect(screen.getByRole('link', { name: 'GitHub' }).getAttribute('href')).toBe(site.socials.github)
    expect(screen.getByRole('link', { name: 'Email' }).getAttribute('href')).toBe(`mailto:${site.email}`)
  })
})
