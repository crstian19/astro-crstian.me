import type { Site, Page, Links, Socials } from "@types";

// Global
export const SITE: Site = {
	TITLE: "Cristian Gutierrez",
	DESCRIPTION: "Welcome to my site",
	AUTHOR: "Cristian Gutierrez",
};

// Work Page
export const WORK: Page = {
	TITLE: "Work",
	DESCRIPTION: "Places I have worked.",
};

// Blog Page
export const BLOG: Page = {
	TITLE: "Blog",
	DESCRIPTION: "Writing on topics I am passionate about.",
};

// Projects Page
export const PROJECTS: Page = {
	TITLE: "Projects",
	DESCRIPTION: "Recent projects I have worked on.",
};

// Search Page
export const SEARCH: Page = {
	TITLE: "Search",
	DESCRIPTION: "Search all posts and projects by keyword.",
};

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
	{
		TEXT: "Projects",
		HREF: "/projects",
	},
];

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
		HREF: "https://github.com/crstian19",
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
];

// Tech stack catalog, keyed by the symbol id in /public/stack.svg
export const STACK = {
	vllm: { text: "vLLM", href: "https://docs.vllm.ai/" },
	litellm: { text: "LiteLLM", href: "https://www.litellm.ai/" },
	k8s: { text: "Kubernetes", href: "https://kubernetes.io/" },
	aws: { text: "AWS", href: "https://aws.amazon.com/" },
	digitalocean: { text: "DigitalOcean", href: "https://www.digitalocean.com/" },
	azure: { text: "Azure", href: "https://azure.microsoft.com/" },
	gcp: { text: "Google Cloud", href: "https://cloud.google.com/" },
	argo: { text: "Argo", href: "https://argoproj.github.io/" },
	kong: { text: "Kong", href: "https://konghq.com/" },
	"github-actions": { text: "GitHub Actions", href: "https://github.com/features/actions" },
	"gitlab-ci": { text: "GitLab CI", href: "https://docs.gitlab.com/ee/ci/" },
	vault: { text: "Vault", href: "https://www.vaultproject.io/" },
	traefik: { text: "Traefik", href: "https://traefik.io/traefik/" },
	nginx: { text: "Nginx", href: "https://nginx.org/" },
	postgresql: { text: "PostgreSQL", href: "https://www.postgresql.org/" },
	grafana: { text: "Grafana", href: "https://grafana.com/" },
	prometheus: { text: "Prometheus", href: "https://prometheus.io/" },
	python: { text: "Python", href: "https://www.python.org/" },
	terraform: { text: "Terraform", href: "https://www.terraform.io/" },
	golang: { text: "Golang", href: "https://go.dev/" },
	astro: { text: "Astro", href: "https://astro.build/" },
	arch: { text: "Arch", href: "https://archlinux.org/" },
	docker: { text: "Docker", href: "https://www.docker.com/" },
} as const;

export type StackKey = keyof typeof STACK;
