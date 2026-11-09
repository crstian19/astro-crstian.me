import { getImage } from "astro:assets";
import type { CollectionEntry } from "astro:content";

// Card logos are shown at 48px (80px on the featured card): 96 and 160 cover
// both at 2x, instead of shipping the 192px source.
const WIDTHS = [96, 160];

export type CardLogo = { src: string; srcset: string; width: number; height: number };

/** Adds a resized `cardLogo` (with a srcset) to each project that has a logo. */
export async function withCardLogos<T extends CollectionEntry<"projects">>(projects: T[]) {
	return Promise.all(
		projects.map(async (project) => {
			const logo = project.data.logo;
			if (!logo) return project;
			const images = await Promise.all(WIDTHS.map((width) => getImage({ src: logo, width, format: "webp", quality: 80 })));
			const cardLogo: CardLogo = {
				src: images[0].src,
				srcset: images.map((image, i) => `${image.src} ${WIDTHS[i]}w`).join(", "),
				width: WIDTHS[0],
				height: Math.round((WIDTHS[0] * logo.height) / logo.width),
			};
			return { ...project, cardLogo };
		}),
	);
}
