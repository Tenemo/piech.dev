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
const REMOTE_RESOURCE_TIMEOUT_MS = 10_000;

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

function shouldResolveRuntimeUrl(url: string): boolean {
    return (
        url.startsWith('//') ||
        url.startsWith('http://') ||
        url.startsWith('https://')
    );
}

async function resolveRuntimeResourceUrl(url: string): Promise<string> {
    if (!shouldResolveRuntimeUrl(url)) {
        return url;
    }

    const resolvedUrl = url.startsWith('//') ? `https:${url}` : url;
    const controller = new AbortController();
    const timeout = setTimeout(() => {
        controller.abort();
    }, REMOTE_RESOURCE_TIMEOUT_MS);

    try {
        const headResponse = await fetch(resolvedUrl, {
            method: 'HEAD',
            redirect: 'follow',
            signal: controller.signal,
        });

        if (headResponse.url) {
            return headResponse.url;
        }
    } catch {
        // Fall back to GET below for origins that reject HEAD.
    } finally {
        clearTimeout(timeout);
    }

    const getController = new AbortController();
    const getTimeout = setTimeout(() => {
        getController.abort();
    }, REMOTE_RESOURCE_TIMEOUT_MS);

    try {
        const getResponse = await fetch(resolvedUrl, {
            method: 'GET',
            redirect: 'follow',
            signal: getController.signal,
        });

        await getResponse.body?.cancel();

        return getResponse.url || resolvedUrl;
    } finally {
        clearTimeout(getTimeout);
    }
}

async function validateResourceUrl({
    attributeName,
    filePath,
    resourceType,
    tagName,
    url,
    violations,
    runtimeUrlCache,
}: {
    attributeName: 'href' | 'poster' | 'src';
    filePath: string;
    resourceType: 'document' | 'image' | 'manifest' | 'media' | 'style';
    tagName: string;
    url: string;
    violations: string[];
    runtimeUrlCache: Map<string, Promise<string>>;
}): Promise<void> {
    try {
        const runtimeUrlPromise =
            runtimeUrlCache.get(url) ?? resolveRuntimeResourceUrl(url);

        runtimeUrlCache.set(url, runtimeUrlPromise);
        const runtimeUrl = await runtimeUrlPromise;

        if (!isAllowedResourceUrl(runtimeUrl, resourceType)) {
            const runtimeDetails =
                runtimeUrl === url ? '' : `, runtime URL "${runtimeUrl}"`;

            violations.push(
                formatElementViolation({
                    details: `resource origin is outside the ${resourceType} allowlist (${attributeName}="${url}"${runtimeDetails})`,
                    filePath,
                    tagName,
                }),
            );
        }
    } catch (error) {
        violations.push(
            formatElementViolation({
                details: `failed to resolve runtime URL for ${attributeName}="${url}" (${String(error)})`,
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
        const runtimeUrlCache = new Map<string, Promise<string>>();

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

            await Promise.all(
                Array.from(
                    document.querySelectorAll(
                        'img[src], source[src], video[src], audio[src], track[src]',
                    ),
                ).map(async (element) => {
                    const url = element.getAttribute('src');
                    const tagName = element.tagName;
                    const resourceType = tagName === 'IMG' ? 'image' : 'media';

                    if (!url) {
                        return;
                    }

                    await validateResourceUrl({
                        attributeName: 'src',
                        filePath: file,
                        resourceType,
                        runtimeUrlCache,
                        tagName,
                        url,
                        violations,
                    });
                }),
            );

            await Promise.all(
                Array.from(document.querySelectorAll('video[poster]')).map(
                    async (element) => {
                        const posterUrl = element.getAttribute('poster');

                        if (!posterUrl) {
                            return;
                        }

                        await validateResourceUrl({
                            attributeName: 'poster',
                            filePath: file,
                            resourceType: 'image',
                            runtimeUrlCache,
                            tagName: element.tagName,
                            url: posterUrl,
                            violations,
                        });
                    },
                ),
            );

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

                await validateResourceUrl({
                    attributeName: 'href',
                    filePath: file,
                    resourceType,
                    runtimeUrlCache,
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
