import { promises as fs } from 'fs';
import path from 'path';

import { JSDOM } from 'jsdom';

import {
    classifyLinkResource,
    isAllowedResourceUrl,
    isExecutableScript,
} from './cspCompatibility.ts';

const outDir = path.resolve(process.cwd(), 'dist/client');
const BANNED_SELECTORS = ['iframe', 'object', 'embed'] as const;

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

function formatElementViolation({
    details,
    filePath,
    tagName,
}: {
    details: string;
    filePath: string;
    tagName: string;
}): string {
    return `${path.relative(outDir, filePath)}: <${tagName.toLowerCase()}> ${details}`;
}

function normalizeUrlForValidation(url: string): string {
    return url.startsWith('//') ? `https:${url}` : url;
}

function validateResourceUrl({
    attributeName,
    filePath,
    resourceType,
    tagName,
    url,
    violations,
}: {
    attributeName: 'href' | 'poster' | 'src';
    filePath: string;
    resourceType: 'document' | 'image' | 'manifest' | 'media' | 'style';
    tagName: string;
    url: string;
    violations: string[];
}): void {
    const normalizedUrl = normalizeUrlForValidation(url);
    const normalizedDetails =
        normalizedUrl === url ? '' : `, normalized URL "${normalizedUrl}"`;

    if (!isAllowedResourceUrl(normalizedUrl, resourceType)) {
        violations.push(
            formatElementViolation({
                details: `resource origin is outside the ${resourceType} allowlist (${attributeName}="${url}"${normalizedDetails})`,
                filePath,
                tagName,
            }),
        );
    }
}

async function validateBuiltHtmlCsp(): Promise<void> {
    console.log(`\nCSP validation: Scanning ${outDir} for built HTML...`);

    try {
        const htmlFiles = await findHtmlFiles(outDir);

        if (htmlFiles.length === 0) {
            throw new Error('No built HTML files found to validate.');
        }

        const violations: string[] = [];

        for (const file of htmlFiles) {
            const content = await fs.readFile(file, 'utf8');
            const dom = new JSDOM(content);
            const { document } = dom.window;

            for (const element of document.querySelectorAll('script')) {
                if (
                    isExecutableScript({
                        src: element.getAttribute('src'),
                        type: element.getAttribute('type'),
                    })
                ) {
                    violations.push(
                        formatElementViolation({
                            details: `executable script detected (src="${element.getAttribute('src') ?? ''}", type="${element.getAttribute('type') ?? ''}")`,
                            filePath: file,
                            tagName: element.tagName,
                        }),
                    );
                }
            }

            for (const selector of BANNED_SELECTORS) {
                for (const element of document.querySelectorAll(selector)) {
                    violations.push(
                        formatElementViolation({
                            details: 'disallowed embedded content detected',
                            filePath: file,
                            tagName: element.tagName,
                        }),
                    );
                }
            }

            for (const element of document.querySelectorAll(
                'img[src], source[src], video[src], audio[src], track[src]',
            )) {
                const url = element.getAttribute('src');
                const tagName = element.tagName;
                const resourceType = tagName === 'IMG' ? 'image' : 'media';

                if (!url) {
                    continue;
                }

                validateResourceUrl({
                    attributeName: 'src',
                    filePath: file,
                    resourceType,
                    tagName,
                    url,
                    violations,
                });
            }

            for (const element of document.querySelectorAll('video[poster]')) {
                const posterUrl = element.getAttribute('poster');

                if (!posterUrl) {
                    continue;
                }

                validateResourceUrl({
                    attributeName: 'poster',
                    filePath: file,
                    resourceType: 'image',
                    tagName: element.tagName,
                    url: posterUrl,
                    violations,
                });
            }

            for (const element of document.querySelectorAll(
                'link[href][rel]',
            )) {
                const href = element.getAttribute('href');
                const rel = element.getAttribute('rel');
                const tagName = element.tagName;

                if (!href || !rel) {
                    continue;
                }

                const resourceType = classifyLinkResource({
                    as: element.getAttribute('as'),
                    rel,
                });

                if (resourceType === 'ignore') {
                    continue;
                }

                if (resourceType === 'disallowed') {
                    violations.push(
                        formatElementViolation({
                            details: `disallowed fetchable link detected (rel="${rel}", as="${element.getAttribute('as') ?? ''}", href="${href}")`,
                            filePath: file,
                            tagName,
                        }),
                    );
                    continue;
                }

                validateResourceUrl({
                    attributeName: 'href',
                    filePath: file,
                    resourceType,
                    tagName,
                    url: href,
                    violations,
                });
            }
        }

        if (violations.length > 0) {
            console.error('\nCSP validation failed. Violations found:\n');
            console.error(violations.map((item) => `- ${item}`).join('\n'));
            process.exit(1);
        }

        console.log(
            `CSP validation: ${htmlFiles.length.toString()} HTML files passed.\n`,
        );
    } catch (error) {
        console.error('CSP validation: An error occurred:', String(error));
        process.exit(1);
    }
}

void validateBuiltHtmlCsp();
