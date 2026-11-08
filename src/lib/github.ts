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

const pullsCache = new Map<string, Promise<number | undefined>>();

/**
 * Total downloads of a GHCR image (ghcr.io/owner/name). GHCR has no public API
 * for it, so it is read from the package page on github.com; undefined if the
 * page can't be reached or its layout changed.
 */
function fetchPulls(image: string) {
	const match = image.match(/^ghcr\.io\/([^/]+)\/([^:@]+)/);
	if (!match) return Promise.resolve(undefined);
	const [, owner, name] = match;
	if (!pullsCache.has(image)) {
		pullsCache.set(
			image,
			fetch(`https://github.com/users/${owner}/packages/container/package/${encodeURIComponent(name)}`, {
				headers: { "User-Agent": "crstian.me" },
				signal: AbortSignal.timeout(8000),
			})
				.then(async (res) => {
					if (!res.ok) return undefined;
					const total = (await res.text()).match(/Total downloads[\s\S]{0,400}?title="([\d,]+)"/)?.[1];
					return total ? Number(total.replaceAll(",", "")) : undefined;
				})
				.catch(() => undefined),
		);
	}
	return pullsCache.get(image)!;
}

const downloadsCache = new Map<string, Promise<number | undefined>>();

/**
 * Downloads of a VS Code extension (publisher.name): Open VSX downloads plus
 * VS Code Marketplace installs, the numbers each store shows on its page.
 * undefined if either store can't be reached.
 */
function fetchDownloads(extension: string) {
	const [publisher, name] = extension.split(".");
	if (!downloadsCache.has(extension)) {
		const openVsx = fetch(`https://open-vsx.org/api/${publisher}/${name}`, { signal: AbortSignal.timeout(8000) })
			.then(async (res) => (res.ok ? ((await res.json()).downloadCount as number) : undefined));
		const marketplace = fetch("https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery", {
			method: "POST",
			headers: { "Content-Type": "application/json", Accept: "application/json;api-version=7.2-preview.1" },
			// filterType 7: extension name; flags 256: include statistics.
			body: JSON.stringify({ filters: [{ criteria: [{ filterType: 7, value: extension }] }], flags: 256 }),
			signal: AbortSignal.timeout(8000),
		}).then(async (res) => {
			if (!res.ok) return undefined;
			const stats: { statisticName: string; value: number }[] =
				(await res.json()).results?.[0]?.extensions?.[0]?.statistics ?? [];
			return stats.find((stat) => stat.statisticName === "install")?.value;
		});
		downloadsCache.set(
			extension,
			Promise.all([openVsx, marketplace])
				.then(([a, b]) => (typeof a === "number" && typeof b === "number" ? a + b : undefined))
				.catch(() => undefined),
		);
	}
	return downloadsCache.get(extension)!;
}

/** Projects with live stars, forks, image pulls and extension downloads, falling back to the counts in their frontmatter. */
export async function withGithubStats(projects: CollectionEntry<"projects">[]) {
	return Promise.all(
		projects.map(async (project) => {
			const repo = githubRepo(project.data.repoUrl);
			const [stats, pulls, downloads] = await Promise.all([
				repo ? fetchStats(repo) : undefined,
				project.data.dockerImage ? fetchPulls(project.data.dockerImage) : undefined,
				project.data.vscodeExtension ? fetchDownloads(project.data.vscodeExtension) : undefined,
			]);
			return {
				...project,
				data: {
					...project.data,
					...stats,
					...(pulls !== undefined && { pulls }),
					...(downloads !== undefined && { downloads }),
				},
			};
		}),
	);
}
