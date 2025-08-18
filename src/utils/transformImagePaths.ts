import { promises as fs } from 'fs';
import path from 'path';

const outDir = path.resolve(process.cwd(), 'dist/client');
const imageSrcRegex = /src="(\/media\/(?:logos|projects)\/[^"]+)"/g;
const preloadHrefRegex = /href="(\/media\/(?:logos|projects)\/[^"]+)"/g;

async function findHtmlFiles(dir: string): Promise<string[]> {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const dirents = await fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
        dirents.map((dirent) => {
            const res = path.resolve(dir, dirent.name);
            if (dirent.isDirectory()) {
                return findHtmlFiles(res);
            }
            return res.endsWith('.html') ? res : null;
        }),
    );
    return (Array.prototype.concat(...files) as (string | null)[]).filter(
        (file): file is string => file !== null,
    );
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
            // eslint-disable-next-line security/detect-non-literal-fs-filename
            let content = await fs.readFile(file, 'utf-8');
            let replacementsInFile = 0;

            content = content.replace(
                imageSrcRegex,
                (_match, originalUrl: string) => {
                    const isLogo = originalUrl.startsWith('/media/logos/');
                    // Width rules:
                    // - Default: 600px
                    // - Logos: 96px
                    const width = isLogo ? 96 : 600;

                    replacementsInFile += 1;
                    const netlifyUrl = `/.netlify/images?url=${originalUrl}&w=${width.toString()}`;
                    return `src="${netlifyUrl}"`;
                },
            );

            content = content.replace(
                preloadHrefRegex,
                (
                    match: string,
                    originalUrl: string,
                    offset: number,
                    full: string,
                ) => {
                    const tagStart = full.lastIndexOf('<', offset);
                    const tagEnd = full.indexOf('>', offset);
                    if (tagStart === -1 || tagEnd === -1) return match;
                    const tag = full.slice(tagStart, tagEnd + 1);

                    const isLinkTag = /^<\s*link\b/i.test(tag);
                    const hasPreload = /\brel=("|')preload\1/i.test(tag);
                    const hasAsImage = /\bas=("|')image\1/i.test(tag);
                    if (!isLinkTag || !hasPreload || !hasAsImage) return match;

                    const isLogo = originalUrl.startsWith('/media/logos/');
                    const width = isLogo ? 96 : 600;

                    replacementsInFile += 1;
                    const netlifyUrl = `/.netlify/images?url=${originalUrl}&w=${width.toString()}`;
                    return `href="${netlifyUrl}"`;
                },
            );

            if (replacementsInFile > 0) {
                // eslint-disable-next-line security/detect-non-literal-fs-filename
                await fs.writeFile(file, content, 'utf-8');
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
