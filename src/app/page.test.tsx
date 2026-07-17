import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/lib/aggregate', () => ({
  getAllPosts: vi.fn(async () => []),
}))

describe('HomePage', () => {
  it('renders the hero name heading', async () => {
    const { default: HomePage } = await import('./page')
    const ui = await HomePage()
    render(ui)
    expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
  })
})
