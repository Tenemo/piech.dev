import { promises as fs } from 'fs';
import path from 'path';

import { JSDOM } from 'jsdom';

import {
    classifyLinkResource,
    isAllowedResourceUrl,
    isExecutableScript,
} from './cspCompatibility.ts'; // eslint-disable-line import/extensions

const outDir = path.resolve(process.cwd(), 'dist/client');
const BANNED_SELECTORS = ['iframe', 'object', 'embed'] as const;

async function findHtmlFiles(dir: string): Promise<string[]> {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
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

function validateResourceElements({
    attributeName,
    elements,
    filePath,
    violations,
}: {
    attributeName: 'poster' | 'src';
    elements: NodeListOf<Element>;
    filePath: string;
    violations: string[];
}): void {
    for (const element of elements) {
        const url = element.getAttribute(attributeName);
        const tagName = element.tagName;
        const resourceType = attributeName === 'poster' ? 'image' : 'media';

        if (!url) {
            continue;
        }

        const normalizedResourceType: 'image' | 'media' =
            tagName === 'IMG' ? 'image' : resourceType;

        if (!isAllowedResourceUrl(url, normalizedResourceType)) {
            violations.push(
                formatElementViolation({
                    details: `resource origin is outside the ${normalizedResourceType} allowlist (${attributeName}="${url}")`,
                    filePath,
                    tagName,
                }),
            );
        }
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
            // eslint-disable-next-line security/detect-non-literal-fs-filename
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

            validateResourceElements({
                attributeName: 'src',
                elements: document.querySelectorAll(
                    'img[src], source[src], video[src], audio[src], track[src]',
                ),
                filePath: file,
                violations,
            });

            validateResourceElements({
                attributeName: 'poster',
                elements: document.querySelectorAll('video[poster]'),
                filePath: file,
                violations,
            });

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

                if (!isAllowedResourceUrl(href, resourceType)) {
                    violations.push(
                        formatElementViolation({
                            details: `resource origin is outside the ${resourceType} allowlist (rel="${rel}", href="${href}")`,
                            filePath: file,
                            tagName,
                        }),
                    );
                }
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
