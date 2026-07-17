import type { Metadata } from 'next'
import { ResumeEmbed } from '@/components/resume/ResumeEmbed'

export const metadata: Metadata = {
  title: 'Resume — Abdur Rakib',
  description: 'Download or preview my resume.',
}

export default function ResumePage() {
  return <ResumeEmbed />
}
