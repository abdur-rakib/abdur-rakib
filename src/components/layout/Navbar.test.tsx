import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Navbar } from './Navbar'

vi.mock('next/navigation', () => ({
  usePathname: () => '/blog',
}))

describe('Navbar', () => {
  it('renders Home, Blog, and Resume links', () => {
    render(<Navbar />)
    expect(screen.getByRole('link', { name: 'Home' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Blog' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Resume' })).toBeTruthy()
  })

  it('marks the current route as active', () => {
    render(<Navbar />)
    const blogLink = screen.getByRole('link', { name: 'Blog' })
    expect(blogLink.className).toContain('font-medium')
  })

  it('renders the theme toggle button', () => {
    render(<Navbar />)
    expect(screen.getByRole('button', { name: /toggle theme/i })).toBeTruthy()
  })
})
