import type { Site, Page, Links, Socials } from "@types"

// Global
export const SITE: Site = {
  TITLE: "Cristian Gutierrez",
  DESCRIPTION: "Welcome to my site",
  AUTHOR: "Cristian Gutierrez",
}

// Work Page
export const WORK: Page = {
  TITLE: "Work",
  DESCRIPTION: "Places I have worked.",
}

// Blog Page
export const BLOG: Page = {
  TITLE: "Blog",
  DESCRIPTION: "Writing on topics I am passionate about.",
}

// Projects Page 
export const PROJECTS: Page = {
  TITLE: "Projects",
  DESCRIPTION: "Recent projects I have worked on.",
}

// Search Page
export const SEARCH: Page = {
  TITLE: "Search",
  DESCRIPTION: "Search all posts and projects by keyword.",
}

// Links
export const LINKS: Links = [
  { 
    TEXT: "Home", 
    HREF: "/", 
  },
  { 
    TEXT: "Work", 
    HREF: "/work", 
  },
  { 
    TEXT: "Blog", 
    HREF: "https://blog.crstian.me/", 
  },
  // { 
  //   TEXT: "Projects", 
  //   HREF: "/projects", 
  // },
]

// Socials
export const SOCIALS: Socials = [
  { 
    NAME: "Email",
    ICON: "email", 
    TEXT: "cristian@crstian.me",
    HREF: "mailto:cristian@crstian.me",
  },
  { 
    NAME: "Github",
    ICON: "github",
    TEXT: "crstian19",
    HREF: "https://github.com/crstian19"
  },
  { 
    NAME: "LinkedIn",
    ICON: "linkedin",
    TEXT: "Cristian Gutierrez",
    HREF: "https://www.linkedin.com/in/cristian-gutierrez-lopez/",
  },
  { 
    NAME: "Gitlab",
    ICON: "gitlab",
    TEXT: "crstian",
    HREF: "https://gitlab.com/Crstian",
  },
  { 
    NAME: "Mastodon",
    ICON: "mastodon",
    TEXT: "crstian",
    HREF: "https://mastodon.social/@crstian",
  },
  
]

