import type { Site, Page, Links, Socials } from "@types";

// Global
export const SITE: Site = {
	TITLE: "Cristian Gutiérrez",
	DESCRIPTION: "Cristian Gutiérrez, SRE / AI Platform Engineer. Kubernetes, observability, LLM inference platforms and a homelab with too many clusters.",
	AUTHOR: "Cristian Gutiérrez",
};

// Work Page
export const WORK: Page = {
	TITLE: "Work",
	DESCRIPTION: "Places I have worked.",
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
		TEXT: "Projects",
		HREF: "/projects",
	},
	// Talks lives at /talks/ (redirected to the talks project, public/_redirects); not in the header yet:
	// { TEXT: "Talks", HREF: "/talks/", RELOAD: true },
	{
		TEXT: "Blog",
		HREF: "https://blog.crstian.me/",
	},
];

// Socials
// Same links, order and icons (Remix Icon via Iconify) as the home of blog.crstian.me.
export const SOCIALS: Socials = [
	{
		NAME: "GitHub",
		ICON: "icon-[ri--github-fill]",
		TEXT: "crstian19",
		HREF: "https://github.com/crstian19",
	},
	{
		NAME: "GitLab",
		ICON: "icon-[ri--gitlab-fill]",
		TEXT: "Crstian",
		HREF: "https://gitlab.com/Crstian",
	},
	{
		NAME: "LinkedIn",
		ICON: "icon-[ri--linkedin-box-fill]",
		TEXT: "Cristian Gutiérrez",
		HREF: "https://www.linkedin.com/in/cristian-gutierrez-lopez/",
	},
	{
		NAME: "X",
		ICON: "icon-[ri--twitter-x-fill]",
		TEXT: "crstiax",
		HREF: "https://x.com/crstiax",
	},
	{
		NAME: "Mastodon",
		ICON: "icon-[ri--mastodon-fill]",
		TEXT: "@crstian",
		HREF: "https://mastodon.social/@crstian",
		// Lets Mastodon verify this link on the profile.
		REL: "me",
	},
	{
		NAME: "Email",
		ICON: "icon-[ri--mail-line]",
		TEXT: "cristian@crstian.me",
		HREF: "mailto:cristian@crstian.me",
	},
];

// Tech stack catalog, keyed by the symbol id in /public/stack.svg. Names, links
// and logos match the stack on blog.crstian.me; the cloud, CI and language
// entries below them are kept for the skills of each job on /work.
export const STACK = {
	// Same as the blog home, in its three groups.
	agentgateway: { text: "agentgateway", href: "https://agentgateway.dev/" },
	nvidia: { text: "NVIDIA", href: "https://developer.nvidia.com/" },
	keda: { text: "KEDA", href: "https://keda.sh/" },
	kgateway: { text: "kgateway", href: "https://kgateway.dev/" },
	"cert-manager": { text: "cert-manager", href: "https://cert-manager.io/" },
	infisical: { text: "Infisical", href: "https://infisical.com/" },
	helm: { text: "Helm", href: "https://helm.sh/" },
	cloudnativepg: { text: "CloudNativePG", href: "https://cloudnative-pg.io/" },
	dragonfly: { text: "Dragonfly", href: "https://www.dragonflydb.io/" },
	cloudflare: { text: "Cloudflare", href: "https://www.cloudflare.com/" },
	victoriametrics: { text: "VictoriaMetrics", href: "https://victoriametrics.com/" },
	loki: { text: "Loki", href: "https://grafana.com/oss/loki/" },
	tempo: { text: "Tempo", href: "https://grafana.com/oss/tempo/" },
	nixos: { text: "NixOS", href: "https://nixos.org/" },
	hetzner: { text: "Hetzner", href: "https://www.hetzner.com/" },
	vllm: { text: "vLLM", href: "https://docs.vllm.ai/" },
	litellm: { text: "LiteLLM", href: "https://www.litellm.ai/" },
	k8s: { text: "Kubernetes", href: "https://kubernetes.io/" },
	aws: { text: "AWS", href: "https://aws.amazon.com/" },
	digitalocean: { text: "DigitalOcean", href: "https://www.digitalocean.com/" },
	azure: { text: "Azure", href: "https://azure.microsoft.com/" },
	gcp: { text: "Google Cloud", href: "https://cloud.google.com/" },
	argo: { text: "Argo CD", href: "https://argo-cd.readthedocs.io/" },
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
	typescript: { text: "TypeScript", href: "https://www.typescriptlang.org/" },
	tailwind: { text: "Tailwind", href: "https://tailwindcss.com/" },
} as const;

export type StackKey = keyof typeof STACK;
