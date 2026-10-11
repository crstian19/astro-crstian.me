import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { STACK, type StackKey } from "./consts";

const stackKeys = Object.keys(STACK) as [StackKey, ...StackKey[]];

const work = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/work" }),
	schema: z.object({
		company: z.string(),
		role: z.string(),
		dateStart: z.coerce.date(),
		dateEnd: z.union([z.coerce.date(), z.string()]),
		skills: z.array(z.enum(stackKeys)).optional(),
	}),
});

const projects = defineCollection({
	loader: glob({ pattern: "**/index.md", base: "./src/content/projects" }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			summary: z.string(),
			date: z.coerce.date(),
			tags: z.array(z.string()),
			draft: z.boolean().optional(),
			demoUrl: z.string().optional(),
			repoUrl: z.string().optional(),
			// Card logo, built with `bun run logo <slug>` (scripts/project-logo.ts).
			logo: image().optional(),
			// Iconify class shown when there's no logo, as on the blog.
			icon: z.string().optional(),
			// Fallback GitHub counts (src/lib/github.ts fetches the real ones).
			stars: z.number().default(0),
			forks: z.number().default(0),
			// Container image (ghcr.io/owner/name) and its fallback download count.
			dockerImage: z.string().optional(),
			pulls: z.number().optional(),
		}),
});

const legal = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/legal" }),
	schema: z.object({
		title: z.string(),
		date: z.coerce.date(),
	}),
});

export const collections = { work, projects, legal };
