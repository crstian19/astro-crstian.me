import { existsSync } from "node:fs";
import sharp from "sharp";

// Sparse → dense: drawn on a black canvas, so bright pixels get the dense glyphs.
const CHARS = " .,:-=+*#%@";
// Width / height of a monospace cell, so the grid keeps the image's proportions.
export const CELL_ASPECT = 0.786;

export type PortraitSource = string | Buffer | { bg: string; fg: string };

export type PortraitFrame = {
	/** One string per row, one glyph per cell. */
	chars: string[];
	/** Three hex digits (12-bit rgb) per cell, row by row. */
	colors: string;
};

export type Portrait = {
	cols: number;
	rows: number;
	frames: PortraitFrame[];
	/** Delay between frames in ms (animated sources only). */
	frameMs: number;
	/** A still, light copy of the image as a webp data URI (still sources only). */
	photo?: string;
};

/** Paths starting with "/" are under public/; anything else is relative to the repo. */
const resolve = (p: string) => (p.startsWith("/") && existsSync(`public${p}`) ? `public${p}` : p);

/**
 * Builds the ASCII frames of an image at build time. Still images are cropped to
 * a square (the hero portrait); animated ones keep their proportions and every frame.
 * `contrast` stretches the luminance range before picking glyphs, for flat,
 * bright images (cartoons) whose mid tones would otherwise get faint glyphs.
 */
export async function buildPortrait(source: PortraitSource, cols = 56, { contrast = false } = {}): Promise<Portrait> {
	// A path, an image already in memory (the QR on /links) or a background plus a cut-out.
	const layered = typeof source === "object" && !Buffer.isBuffer(source);
	const file = typeof source === "string" ? resolve(source) : layered ? resolve(source.bg) : source;
	const meta = await sharp(file, { animated: true }).metadata();
	const pages = layered ? 1 : (meta.pages ?? 1);
	const animated = pages > 1;

	// RGB pages of the image, all the same size.
	let width: number;
	let height: number;
	let pageBuffers: Buffer[];
	if (animated) {
		width = meta.width!;
		height = meta.pageHeight ?? meta.height! / pages;
		const raw = await sharp(file, { animated: true }).flatten({ background: "#000" }).removeAlpha().raw().toBuffer();
		const pageSize = width * height * 3;
		pageBuffers = Array.from({ length: pages }, (_, i) => raw.subarray(i * pageSize, (i + 1) * pageSize));
	} else {
		// Composite the layers and crop to a square, so the grid and the photo share one framing.
		const base = layered ? sharp(file).composite([{ input: resolve(source.fg) }]) : sharp(file);
		const square = await sharp(await base.png().toBuffer())
			.resize(640, 640, { fit: "cover" })
			.png()
			.toBuffer();
		width = height = 640;
		pageBuffers = [await sharp(square).removeAlpha().raw().toBuffer()];
	}

	const rows = Math.round((cols * height * CELL_ASPECT) / width);
	const frames = await Promise.all(
		pageBuffers.map(async (page) => {
			const small = sharp(page, { raw: { width, height, channels: 3 } }).resize(cols, rows, { fit: "fill" });
			const data = await small.clone().raw().toBuffer();
			// Glyph density can come from a contrast-stretched copy; colours stay the originals.
			const shade = contrast ? await small.clone().normalise({ lower: 3, upper: 97 }).gamma(1.6).raw().toBuffer() : data;
			const chars: string[] = [];
			let colors = "";
			for (let y = 0; y < rows; y++) {
				let line = "";
				for (let x = 0; x < cols; x++) {
					const i = (y * cols + x) * 3;
					const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
					const lum = 0.21 * shade[i] + 0.72 * shade[i + 1] + 0.07 * shade[i + 2];
					line += CHARS[Math.floor((lum / 255) * (CHARS.length - 1))];
					// Glyphs only cover part of each cell, so lift the colour to keep the image readable.
					for (const c of [r, g, b]) colors += Math.min(15, Math.round(Math.min(255, c * 1.3 + 18) / 17)).toString(16);
				}
				chars.push(line);
			}
			return { chars, colors };
		}),
	);

	const photo = animated
		? undefined
		: `data:image/webp;base64,${(
				await sharp(pageBuffers[0], { raw: { width, height, channels: 3 } })
					.webp({ quality: 78 })
					.toBuffer()
			).toString("base64")}`;

	return { cols, rows, frames, frameMs: animated ? (meta.delay?.[0] ?? 90) : 0, photo };
}
