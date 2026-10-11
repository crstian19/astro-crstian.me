import sharp from "sharp";

// Sparse → dense: drawn on a black canvas, so bright pixels get the dense glyphs.
const CHARS = " .,:-=+*#%@";

export type PortraitSource = string | { bg: string; fg: string };

export type Portrait = {
	cols: number;
	rows: number;
	/** One string per row, one glyph per cell. */
	chars: string[];
	/** Flattened r,g,b per cell. */
	colors: number[];
	/** The photo, cropped like the grid, as a small webp data URI. */
	photo: string;
};

/** Builds the ASCII grid and a light copy of the photo at build time. */
export async function buildPortrait(source: PortraitSource, cols = 56, rows = 44): Promise<Portrait> {
	const file = (p: string) => `public${p}`;
	const base = () =>
		typeof source === "string" ? sharp(file(source)) : sharp(file(source.bg)).composite([{ input: file(source.fg) }]);

	// Composite and crop to a square first, so the grid and the photo share one framing.
	const flat = await base().png().toBuffer();
	const square = await sharp(flat).resize(640, 640, { fit: "cover" }).toBuffer();

	// The display is square, so the grid is sampled with a plain stretch.
	const { data } = await sharp(square)
		.resize(cols, rows, { fit: "fill" })
		.removeAlpha()
		.raw()
		.toBuffer({ resolveWithObject: true });

	const chars: string[] = [];
	const colors: number[] = [];
	for (let y = 0; y < rows; y++) {
		let line = "";
		for (let x = 0; x < cols; x++) {
			const i = (y * cols + x) * 3;
			const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
			const lum = 0.21 * r + 0.72 * g + 0.07 * b;
			line += CHARS[Math.floor((lum / 255) * (CHARS.length - 1))];
			// Glyphs only cover part of each cell, so lift the colour to keep the image readable.
			colors.push(...[r, g, b].map((c) => Math.min(255, Math.round(c * 1.3 + 18))));
		}
		chars.push(line);
	}

	const photo = await sharp(square).webp({ quality: 78 }).toBuffer();

	return { cols, rows, chars, colors, photo: `data:image/webp;base64,${photo.toString("base64")}` };
}
