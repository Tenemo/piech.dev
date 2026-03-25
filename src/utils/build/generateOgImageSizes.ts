import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { imageSize } from 'image-size';

const ogImagesDirectory = path.resolve(
    process.cwd(),
    'public/media/projects/og_images',
);
const outputFile = path.resolve(
    process.cwd(),
    'src/utils/media/ogImageSizes.generated.ts',
);
const supportedExtensions = new Set([
    '.avif',
    '.gif',
    '.jpeg',
    '.jpg',
    '.png',
    '.webp',
]);

const imageFiles = readdirSync(ogImagesDirectory)
    .filter((fileName) => supportedExtensions.has(path.extname(fileName)))
    .sort((firstFileName, secondFileName) =>
        firstFileName.localeCompare(secondFileName),
    );

const imageSizes = imageFiles.map((fileName) => {
    const imagePath = path.join(ogImagesDirectory, fileName);
    // The path is resolved from the fixed OG images directory.
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const { width, height } = imageSize(readFileSync(imagePath));

    if (!width || !height) {
        throw new Error(`Could not determine OG image size for "${fileName}"`);
    }

    return { fileName, width, height };
});

const generatedEntries = imageSizes.map(
    ({ fileName, width, height }) =>
        `    '${fileName}': { width: ${String(width)}, height: ${String(height)} },`,
);

const fileContents = [
    'type OgImageSize = { width: number; height: number };',
    '',
    'export const OG_IMAGE_SIZES: Partial<Record<string, OgImageSize>> = {',
    ...generatedEntries,
    '};',
    '',
].join('\n');

writeFileSync(outputFile, fileContents);

console.log(
    `[ogImageSizes] Wrote ${String(imageFiles.length)} image sizes to ${outputFile}`,
);
