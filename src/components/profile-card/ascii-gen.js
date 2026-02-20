import sharp from 'sharp';

const CHARS = "@%#*+=-:,. ";

export async function generateProfileAscii(item) {
    const isMasked = typeof item === 'object' && item.fg;
    const bgPath = isMasked ? `public${item.bg}` : `public${item}`;
    const fgPath = isMasked ? `public${item.fg}` : null;

    const canvasSize = 640;
    const fontSize = 20;
    const charWidth = fontSize * 0.8;
    const charHeight = fontSize;
    const cols = Math.floor(canvasSize / charWidth);
    const rows = Math.floor(canvasSize / charHeight);

    try {
        let image = sharp(bgPath);

        if (isMasked && fgPath) {
            image = image.composite([{ input: fgPath }]);
        }

        // Resize to the grid size to sample pixels easily
        const { data, info } = await image
            .resize(cols, rows, { fit: 'cover' })
            .ensureAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true });

        const asciiData = [];
        for (let y = 0; y < rows; y++) {
            const row = [];
            for (let x = 0; x < cols; x++) {
                const i = (y * cols + x) * 4;
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const a = data[i + 3];

                // Simple luminance formula
                const lum = 0.21 * r + 0.72 * g + 0.07 * b;
                const charIndex = Math.floor((lum / 255) * (CHARS.length - 1));

                row.push({
                    char: CHARS[charIndex],
                    color: `rgb(${r},${g},${b})`
                });
            }
            asciiData.push(row);
        }

        return {
            asciiData,
            cols,
            rows,
            fontSize,
            charWidth,
            charHeight,
            canvasSize
        };
    } catch (err) {
        console.error("Error generating ASCII:", err);
        return null;
    }
}
