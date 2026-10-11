import type { CollectionEntry } from "astro:content";

const cache = new Map<string, Promise<{ stars: number; forks: number } | undefined>>();

/** owner/repo from a GitHub URL, or undefined for other hosts. */
export function githubRepo(url?: string) {
	if (!url) return undefined;
	try {
		const { hostname, pathname } = new URL(url);
		if (!hostname.endsWith("github.com")) return undefined;
		const [owner, repo] = pathname.split("/").filter(Boolean);
		return owner && repo ? `${owner}/${repo}` : undefined;
	} catch {
		return undefined;
	}
}

/** Stars and forks from the GitHub API at build time; undefined if it can't be reached. */
function fetchStats(repo: string) {
	if (!cache.has(repo)) {
		cache.set(
			repo,
			fetch(`https://api.github.com/repos/${repo}`, {
				headers: { Accept: "application/vnd.github+json", "User-Agent": "crstian.me" },
				signal: AbortSignal.timeout(8000),
			})
				.then(async (res) => {
					if (!res.ok) return undefined;
					const data = await res.json();
					return { stars: data.stargazers_count as number, forks: data.forks_count as number };
				})
				.catch(() => undefined),
		);
	}
	return cache.get(repo)!;
}

/** Projects with live stars and forks, falling back to the counts in their frontmatter. */
export async function withGithubStats(projects: CollectionEntry<"projects">[]) {
	return Promise.all(
		projects.map(async (project) => {
			const repo = githubRepo(project.data.repoUrl);
			const stats = repo ? await fetchStats(repo) : undefined;
			return stats ? { ...project, data: { ...project.data, ...stats } } : project;
		}),
	);
}
