import { readFileSync } from 'node:fs';
import path from 'node:path';

import { imageSize } from 'image-size';

export type ImageSize = { width: number; height: number } | null;

function resolveToAbsolute(imagePath: string): string {
    // Accept any absolute path; for relative paths, resolve from project root (process.cwd())
    return path.isAbsolute(imagePath)
        ? path.normalize(imagePath)
        : path.resolve(process.cwd(), imagePath);
}

/**
 * Returns the width and height for a local image file.
 * - Accepts an absolute path or a path relative to the project's public/ directory.
 * - On any error or missing file, returns null.
 */
export function getImageSize(imagePath: string): ImageSize {
    try {
        const absPath = resolveToAbsolute(imagePath);

        // eslint-disable-next-line security/detect-non-literal-fs-filename
        const data = readFileSync(absPath);
        const { width, height } = imageSize(data);
        if (
            typeof width === 'number' &&
            Number.isFinite(width) &&
            typeof height === 'number' &&
            Number.isFinite(height)
        ) {
            return { width, height };
        }
        return null;
    } catch {
        return null;
    }
}
