export type BlogPost = {
	title: string;
	link: string;
	date: Date;
	description: string;
};

const FEED_URL = "https://blog.crstian.me/en/index.xml";

function decode(text: string) {
	return text
		.replace(/^<!\[CDATA\[|\]\]>$/g, "")
		.replace(/&#0?39;/g, "'")
		.replace(/&quot;/g, '"')
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&amp;/g, "&")
		.trim();
}

function tag(item: string, name: string) {
	const match = item.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`));
	return match ? decode(match[1]) : "";
}

/**
 * Latest posts from blog.crstian.me, read from its RSS feed at build time.
 * Returns an empty list when the feed can't be reached, so the build never
 * depends on the blog being up.
 */
export async function getLatestPosts(limit = 3): Promise<BlogPost[]> {
	try {
		const res = await fetch(FEED_URL, { signal: AbortSignal.timeout(8000) });
		if (!res.ok) return [];
		const xml = await res.text();
		return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
			.slice(0, limit)
			.map(([, item]) => ({
				title: tag(item, "title"),
				link: tag(item, "link"),
				date: new Date(tag(item, "pubDate")),
				description: tag(item, "description"),
			}))
			.filter((post) => post.title && post.link);
	} catch {
		return [];
	}
}
