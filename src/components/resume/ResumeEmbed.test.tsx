import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ResumeEmbed } from './ResumeEmbed'
import { site } from '@/config/site'

describe('ResumeEmbed', () => {
  it('embeds the local resume PDF', () => {
    render(<ResumeEmbed />)
    const iframe = screen.getByTitle(`${site.name} resume`)
    expect(iframe.getAttribute('src')).toBe('/resume.pdf#toolbar=0&navpanes=0')
  })

  it('links the download button to the local resume PDF', () => {
    render(<ResumeEmbed />)
    const link = screen.getByRole('link', { name: /download pdf/i })
    expect(link.getAttribute('href')).toBe('/resume.pdf')
  })
})
