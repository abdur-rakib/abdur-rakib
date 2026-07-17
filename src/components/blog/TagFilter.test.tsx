import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TagFilter } from './TagFilter'

const manyTags = Array.from({ length: 12 }, (_, i) => `tag-${i}`)

describe('TagFilter', () => {
  it('renders all tags when under the visible limit', () => {
    render(<TagFilter tags={['react', 'node']} value="all" onChange={() => {}} />)
    expect(screen.getByRole('button', { name: 'react' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'node' })).toBeTruthy()
    expect(screen.queryByText(/more/)).toBeNull()
  })

  it('caps visible tags and shows a "+N more" toggle beyond the limit', () => {
    render(<TagFilter tags={manyTags} value="all" onChange={() => {}} />)
    expect(screen.getByRole('button', { name: 'tag-4' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'tag-5' })).toBeNull()
    expect(screen.getByRole('button', { name: '+7 more' })).toBeTruthy()
  })

  it('expands to show every tag after clicking "+N more"', async () => {
    const user = userEvent.setup()
    render(<TagFilter tags={manyTags} value="all" onChange={() => {}} />)

    await user.click(screen.getByRole('button', { name: '+7 more' }))

    expect(screen.getByRole('button', { name: 'tag-11' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Show less' })).toBeTruthy()
  })
})
