export type Page = {
	TITLE: string;
	DESCRIPTION: string;
};

export interface Site extends Page {
	AUTHOR: string;
}

export type Links = {
	TEXT: string;
	HREF: string;
	/** Not an Astro page (e.g. /talks, proxied to another project): load it in full, no client router. */
	RELOAD?: boolean;
}[];

export type Socials = {
	NAME: string;
	/** Iconify class, e.g. icon-[ri--github-fill] */
	ICON: string;
	TEXT: string;
	HREF: string;
	REL?: string;
}[];
