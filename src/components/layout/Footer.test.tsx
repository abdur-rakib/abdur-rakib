import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Footer } from './Footer'

describe('Footer', () => {
  it('renders GitHub, LinkedIn, and Medium links', () => {
    render(<Footer />)
    expect(screen.getByRole('link', { name: /github/i })).toBeTruthy()
    expect(screen.getByRole('link', { name: /linkedin/i })).toBeTruthy()
    expect(screen.getByRole('link', { name: /medium/i })).toBeTruthy()
  })
})
