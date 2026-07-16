export interface SiteConfig {
  name: string
  role: string
  location: string
  bio: string
  email: string
  socials: {
    github: string
    linkedin: string
    medium: string
    devto: string
    hashnode: string
  }
  resumeDriveFileId: string
}

export const site: SiteConfig = {
  name: 'Abdur Rakib',
  role: 'Senior Software Engineer · Backend-Focused Full Stack',
  location: 'Dhaka, Bangladesh',
  bio: 'I build scalable web, mobile, and backend systems — microservices, event-driven architectures, and API gateways that hold up under millions of calls a day.',
  email: 'abdurrakib961@gmail.com',
  socials: {
    github: 'https://github.com/abdur-rakib',
    linkedin: 'https://linkedin.com/in/abdurrakibcseruet',
    medium: 'https://medium.com/@abdur-rakib',
    devto: 'https://dev.to/abdur-rakib',
    hashnode: 'https://abdur-rakib.hashnode.dev',
  },
  // Replace with the real Google Drive file ID once the résumé PDF is
  // uploaded and shared as "Anyone with the link — Viewer" (see Task 18).
  resumeDriveFileId: 'REPLACE_WITH_GOOGLE_DRIVE_FILE_ID',
}
