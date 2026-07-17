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
}

export const site: SiteConfig = {
  name: 'Abdur Rakib',
  role: 'Senior Software Engineer · Backend-Focused Full Stack',
  location: 'Dhaka, Bangladesh',
  bio: "5+ years building backend systems in Node.js and TypeScript — microservices, event-driven architectures, and API gateways engineered to hold up under millions of calls a day. Currently at bKash, Bangladesh's largest mobile financial service, where reliability and scale aren't optional.",
  email: 'abdurrakib961@gmail.com',
  socials: {
    github: 'https://github.com/abdur-rakib',
    linkedin: 'https://linkedin.com/in/abdurrakibcseruet',
    medium: 'https://medium.com/@abdur-rakib',
    devto: 'https://dev.to/abdur-rakib',
    hashnode: 'https://abdur-rakib.hashnode.dev',
  },
}
