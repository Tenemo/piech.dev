import fs from 'node:fs';
import path from 'node:path';

import { imageSize } from 'image-size';

export type ImageSize = { width: number; height: number };

function resolveToAbsolute(imagePath: string): string {
    return path.isAbsolute(imagePath)
        ? path.normalize(imagePath)
        : path.resolve(process.cwd(), imagePath);
}

/**
 * Returns the width and height for a local image file.
 * - Accepts an absolute path or a path relative to the project's public/ directory.
 * - On any error or missing file, it throws.
 * - Returns zeroes in the browser.
 */
export function getImageSize(imagePath: string): ImageSize {
    // In non-SSR (client/dev), don't touch the filesystem and return 0x0.
    // During SSR/build, we must resolve actual size; if unavailable, throw.
    if (!import.meta.env.SSR) return { width: 0, height: 0 };

    try {
        const absPath = resolveToAbsolute(imagePath);
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        const data = fs.readFileSync(absPath);
        const { width, height } = imageSize(data);
        if (
            typeof width === 'number' &&
            Number.isFinite(width) &&
            typeof height === 'number' &&
            Number.isFinite(height)
        ) {
            return { width, height };
        }
        throw new Error(`Missing size for OG image: ${imagePath}`);
    } catch {
        throw new Error(`Missing size for OG image: ${imagePath}`);
    }
}
