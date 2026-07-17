import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ResumeEmbed } from './ResumeEmbed'
import { site } from '@/config/site'

describe('ResumeEmbed', () => {
  it('embeds the Drive preview iframe for the configured file id', () => {
    render(<ResumeEmbed />)
    const iframe = screen.getByTitle(`${site.name} résumé`)
    expect(iframe.getAttribute('src')).toBe(
      `https://drive.google.com/file/d/${site.resumeDriveFileId}/preview`
    )
  })

  it('links the download button to the Drive export URL', () => {
    render(<ResumeEmbed />)
    const link = screen.getByRole('link', { name: /download pdf/i })
    expect(link.getAttribute('href')).toBe(
      `https://drive.google.com/uc?export=download&id=${site.resumeDriveFileId}`
    )
  })
})
