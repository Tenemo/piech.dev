import { promises as fs } from 'fs';
import path from 'path';

const outDir = path.resolve(process.cwd(), 'dist/client');
const imageSrcRegex = /src="(\/media\/(?:logos|projects)\/[^"]+)"/g;

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
            const matches = content.match(imageSrcRegex);

            if (matches) {
                content = content.replace(
                    imageSrcRegex,
                    (_match, originalUrl) => {
                        const netlifyUrl = `/.netlify/images?url=${originalUrl as string}&w=128`;
                        return `src="${netlifyUrl}"`;
                    },
                );
                // eslint-disable-next-line security/detect-non-literal-fs-filename
                await fs.writeFile(file, content, 'utf-8');
                transformedCount += matches.length;
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
