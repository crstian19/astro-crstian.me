/**
 * Builds a project's card logo: src/content/projects/<slug>/logo.webp.
 *
 *   bun run logo <slug>               # the first image in the project's index.md (its README logo)
 *   bun run logo <slug> <url|path>    # a specific image
 *   bun run logo <slug> --disc        # logo drawn as a coloured disc on a light background
 *   bun run logo <slug> --keep-bg     # keep the logo's own background, with rounded corners
 *
 * The background is made transparent, the logo is trimmed and centred on a
 * small square, and `logo: ./logo.webp` is added to the frontmatter if missing.
 * Cards show it in grayscale and in colour on hover (src/components/ArrowCard.tsx).
 *
 * Backgrounds:
 * - transparent logos are kept as they are;
 * - a solid background is removed by flood-filling from the four corners;
 * - with --disc the logo is cut to a clean circle around its coloured disc,
 *   for logos whose light ring around the disc a flood fill would eat into;
 * - with --keep-bg the background stays and the corners are rounded, for logos
 *   that need it to be readable (white lettering on black, say).
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const SIZE = 192; // px; cards render the logo at 40-64 CSS px
const WORK = 1024; // images are processed at most this big
const TOLERANCE = 40; // max per-channel difference from the corner colour

type Raw = { data: Buffer; width: number; height: number };

function fail(message: string): never {
	console.error(message);
	process.exit(1);
}

async function load(source: string): Promise<Buffer> {
	if (/^https?:\/\//.test(source)) {
		const res = await fetch(source);
		if (!res.ok) fail(`Could not download ${source}: ${res.status}`);
		return Buffer.from(await res.arrayBuffer());
	}
	if (!existsSync(source)) fail(`No such file: ${source}`);
	return readFileSync(source);
}

/** The first image of the markdown body: an <img src> or a ![](...) link. */
function readmeLogo(markdown: string) {
	const body = markdown.replace(/^---[\s\S]*?\n---/, "");
	return body.match(/<img[^>]+src="([^"]+)"/)?.[1] ?? body.match(/!\[[^\]]*\]\(([^)\s]+)/)?.[1];
}

/** Clears the background connected to the corners. */
function floodBackground({ data, width, height }: Raw) {
	const at = (x: number, y: number) => (y * width + x) * 4;
	if (data[at(2, 2) + 3] < 200) return; // already transparent

	const seen = new Uint8Array(width * height);
	for (const [sx, sy] of [
		[1, 1],
		[width - 2, 1],
		[1, height - 2],
		[width - 2, height - 2],
	]) {
		const s = at(sx, sy);
		const seed = [data[s], data[s + 1], data[s + 2]];
		const stack = [sy * width + sx];
		while (stack.length) {
			const p = stack.pop()!;
			if (seen[p]) continue;
			const i = p * 4;
			if (Math.max(...seed.map((c, k) => Math.abs(data[i + k] - c))) > TOLERANCE) continue;
			seen[p] = 1;
			data[i + 3] = 0;
			const x = p % width;
			const y = (p / width) | 0;
			if (x > 0) stack.push(p - 1);
			if (x < width - 1) stack.push(p + 1);
			if (y > 0) stack.push(p - width);
			if (y < height - 1) stack.push(p + width);
		}
	}
	// Soften the cut: pixels next to the background get half opacity.
	for (let y = 1; y < height - 1; y++) {
		for (let x = 1; x < width - 1; x++) {
			const p = y * width + x;
			if (seen[p]) continue;
			if (seen[p - 1] || seen[p + 1] || seen[p - width] || seen[p + width]) data[p * 4 + 3] >>= 1;
		}
	}
}

/** Rounds the corners of the whole image, keeping its background. */
function roundCorners({ data, width, height }: Raw) {
	const r = Math.min(width, height) * 0.12;
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			// Distance outside the rounded rectangle (0 inside it).
			const dx = Math.max(r - x - 0.5, x + 0.5 - (width - r), 0);
			const dy = Math.max(r - y - 0.5, y + 0.5 - (height - r), 0);
			const edge = Math.min(1, Math.max(0, r - Math.hypot(dx, dy) + 0.5));
			const i = (y * width + x) * 4 + 3;
			data[i] = Math.round(data[i] * edge);
		}
	}
}

/** Keeps only the coloured disc, with an anti-aliased edge. */
function cutDisc({ data, width, height }: Raw) {
	let sumX = 0;
	let sumY = 0;
	let count = 0;
	const saturated: number[] = [];
	for (let p = 0; p < width * height; p++) {
		const i = p * 4;
		const sat = Math.max(data[i], data[i + 1], data[i + 2]) - Math.min(data[i], data[i + 1], data[i + 2]);
		if (sat > 80) {
			sumX += p % width;
			sumY += (p / width) | 0;
			count++;
			saturated.push(p);
		}
	}
	if (!count) fail("--disc: no coloured disc found");
	const cx = sumX / count;
	const cy = sumY / count;
	// Radius from the disc's outermost coloured pixels (99.5th percentile, to skip stray ones).
	const dists = saturated.map((p) => Math.hypot((p % width) - cx, ((p / width) | 0) - cy)).sort((a, b) => a - b);
	const radius = dists[Math.floor(dists.length * 0.995)] * 0.985;
	for (let p = 0; p < width * height; p++) {
		const d = Math.hypot((p % width) + 0.5 - cx, ((p / width) | 0) + 0.5 - cy);
		const edge = Math.min(1, Math.max(0, radius - d + 0.5));
		data[p * 4 + 3] = Math.round(data[p * 4 + 3] * edge);
	}
}

async function main() {
	const args = process.argv.slice(2);
	const isDisc = args.includes("--disc");
	const keepBg = args.includes("--keep-bg");
	const [slug, explicitSource] = args.filter((a) => !a.startsWith("--"));
	if (!slug) fail("Usage: bun run logo <slug> [url|path] [--disc | --keep-bg]");

	const dir = join("src/content/projects", slug);
	const mdPath = join(dir, "index.md");
	if (!existsSync(mdPath)) fail(`No project at ${mdPath}`);
	const markdown = readFileSync(mdPath, "utf8");
	const source = explicitSource ?? readmeLogo(markdown);
	if (!source) fail(`No image in ${mdPath}; pass a URL or path.`);

	const raw = await sharp(await load(source))
		.resize(WORK, WORK, { fit: "inside", withoutEnlargement: true })
		.ensureAlpha()
		.raw()
		.toBuffer({ resolveWithObject: true });
	const image: Raw = { data: raw.data, width: raw.info.width, height: raw.info.height };

	if (isDisc) cutDisc(image);
	else if (keepBg) roundCorners(image);
	else floodBackground(image);

	const out = join(dir, "logo.webp");
	await sharp(image.data, { raw: { width: image.width, height: image.height, channels: 4 } })
		.trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
		.resize(SIZE, SIZE, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
		.webp({ quality: 90, alphaQuality: 100, effort: 6 })
		.toFile(out);

	if (!/^logo:/m.test(markdown.split(/\n---/)[0] + "\n---")) {
		const end = markdown.indexOf("\n---", 3);
		writeFileSync(mdPath, `${markdown.slice(0, end)}\nlogo: ./logo.webp${markdown.slice(end)}`);
	}
	console.log(`${out} from ${source}${isDisc ? " (disc)" : keepBg ? " (keep-bg)" : ""}`);
}

main();
