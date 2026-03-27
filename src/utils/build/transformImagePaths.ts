import { promises as fs } from 'fs';
import path from 'path';

import { JSDOM } from 'jsdom';

const outDir = path.resolve(process.cwd(), 'dist/client');
const EXCLUDED_EXTENSIONS = new Set(['.mp4', '.webm', '.ogg']);

async function findHtmlFiles(dir: string): Promise<string[]> {
    const dirents = await fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
        dirents.map(async (dirent) => {
            const resolvedPath = path.resolve(dir, dirent.name);

            if (dirent.isDirectory()) {
                return findHtmlFiles(resolvedPath);
            }

            return resolvedPath.endsWith('.html') ? [resolvedPath] : [];
        }),
    );

    return files.flat();
}

function getMediaAssetType(url: string): 'logo' | 'project' | null {
    if (url.startsWith('/media/logos/')) {
        return 'logo';
    }

    if (url.startsWith('/media/projects/')) {
        return 'project';
    }

    return null;
}

function toNetlifyImageUrl(originalUrl: string): string {
    const assetType = getMediaAssetType(originalUrl);
    const width = assetType === 'logo' ? 96 : 600;
    const query = new URLSearchParams({
        url: originalUrl,
        w: width.toString(),
    });

    return `/.netlify/images?${query.toString()}`;
}

function shouldTransform(url: string): boolean {
    const urlNoParams = url.split(/[?#]/, 1)[0];
    const ext = path.extname(urlNoParams).toLowerCase();

    return getMediaAssetType(url) !== null && !EXCLUDED_EXTENSIONS.has(ext);
}

async function transformImagePaths(): Promise<void> {
    console.log(`\nNetlify CDN: Scanning ${outDir} for HTML files...`);

    try {
        const htmlFiles = await findHtmlFiles(outDir);

        if (htmlFiles.length === 0) {
            console.warn('Netlify CDN: No HTML files found to process.');
            return;
        }

        let transformedCount = 0;

        for (const file of htmlFiles) {
            const content = await fs.readFile(file, 'utf-8');
            const dom = new JSDOM(content);
            const { document } = dom.window;
            let replacementsInFile = 0;

            for (const element of document.querySelectorAll('[src]')) {
                const originalUrl = element.getAttribute('src');

                if (!originalUrl || !shouldTransform(originalUrl)) {
                    continue;
                }

                element.setAttribute('src', toNetlifyImageUrl(originalUrl));
                replacementsInFile += 1;
            }

            for (const element of document.querySelectorAll(
                'link[rel="preload"][as="image"][href]',
            )) {
                const originalUrl = element.getAttribute('href');

                if (!originalUrl || !shouldTransform(originalUrl)) {
                    continue;
                }

                element.setAttribute('href', toNetlifyImageUrl(originalUrl));
                replacementsInFile += 1;
            }

            if (replacementsInFile > 0) {
                await fs.writeFile(file, dom.serialize(), 'utf-8');
                transformedCount += replacementsInFile;
            }
        }

        console.log(
            `Netlify CDN: Transformed ${transformedCount.toString()} image paths in ${htmlFiles.length.toString()} HTML files.\n`,
        );
    } catch (error) {
        console.error('Netlify CDN: An error occurred:', String(error));
        process.exit(1);
    }
}

void transformImagePaths();
