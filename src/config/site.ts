// GitHub Pages project sites serve from a subpath (e.g. /abdur-rakib). Raw
// `<a href>`/`<img src>` strings referencing /public assets aren't rewritten
// by Next's basePath the way <Link>/<Image> are, so prefix them manually.
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

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
    hashnode: string
  }
}

export const site: SiteConfig = {
  name: 'Abdur Rakib',
  role: 'Senior Software Engineer | Backend Engineer',
  location: 'Dhaka, Bangladesh',
  bio: "5+ years building backend systems in Node.js and TypeScript — microservices, event-driven architectures, and API gateways engineered to hold up under millions of calls a day. Currently at bKash, Bangladesh's largest mobile financial service, where reliability and scale aren't optional.",
  email: 'abdurrakib961@gmail.com',
  socials: {
    github: 'https://github.com/abdur-rakib',
    linkedin: 'https://linkedin.com/in/abdurrakibcseruet',
    medium: 'https://medium.com/@abdur-rakib',
    hashnode: 'https://abdur-rakib.hashnode.dev',
  },
}
