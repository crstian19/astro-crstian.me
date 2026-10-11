import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { SITE } from "@consts";

type Context = {
	site: string;
};

// Feed of the projects; the blog has its own feed at blog.crstian.me.
export async function GET(context: Context) {
	const projects = (await getCollection("projects"))
		.filter((project) => !project.data.draft)
		.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

	return rss({
		title: SITE.TITLE,
		description: SITE.DESCRIPTION,
		site: context.site,
		items: projects.map((project) => ({
			title: project.data.title,
			description: project.data.summary,
			pubDate: project.data.date,
			link: `/projects/${project.id}/`,
		})),
	});
}
