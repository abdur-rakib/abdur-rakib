import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeToggle } from './ThemeToggle'

afterEach(() => {
  cleanup()
  document.documentElement.removeAttribute('data-theme')
  document.documentElement.classList.remove('dark')
  window.localStorage.clear()
})

describe('ThemeToggle', () => {
  it('renders a toggle button', () => {
    render(<ThemeToggle />)
    expect(screen.getByRole('button', { name: /toggle theme/i })).toBeTruthy()
  })

  it('sets data-theme on the document root when clicked', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)
    const button = screen.getByRole('button', { name: /toggle theme/i })

    await user.click(button)
    const firstTheme = document.documentElement.getAttribute('data-theme')
    expect(['light', 'dark']).toContain(firstTheme)

    await user.click(button)
    const secondTheme = document.documentElement.getAttribute('data-theme')
    expect(secondTheme).not.toBe(firstTheme)
  })

  it('uses the theme initialized on the document before hydration', () => {
    document.documentElement.dataset.theme = 'dark'
    render(<ThemeToggle />)

    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })
})
