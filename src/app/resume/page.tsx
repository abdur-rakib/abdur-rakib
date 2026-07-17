import type { Metadata } from 'next'
import { ResumeEmbed } from '@/components/resume/ResumeEmbed'

export const metadata: Metadata = {
  title: 'Résumé — Abdur Rakib',
  description: 'Download or preview my résumé.',
}

export default function ResumePage() {
  return <ResumeEmbed />
}
