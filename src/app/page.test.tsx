import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import Page from './page'

describe('scaffold smoke test', () => {
  it('renders without crashing', () => {
    render(<Page />)
    expect(screen.getByRole('main')).toBeTruthy()
  })
})
