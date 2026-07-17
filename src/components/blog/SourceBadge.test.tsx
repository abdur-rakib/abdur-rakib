import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SourceBadge } from './SourceBadge'

describe('SourceBadge', () => {
  it.each([
    ['hashnode', 'hashnode'],
    ['medium', 'medium'],
  ] as const)('renders the label for %s', (source, label) => {
    render(<SourceBadge source={source} />)
    expect(screen.getByText(label)).toBeTruthy()
  })
})
