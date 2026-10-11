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
}[];

export type Socials = {
	NAME: string;
	/** Iconify class, e.g. icon-[ri--github-fill] */
	ICON: string;
	TEXT: string;
	HREF: string;
	REL?: string;
}[];
