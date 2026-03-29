import { promises as fs } from 'fs';
import path from 'path';

import { JSDOM } from 'jsdom';

import { findHtmlFiles } from './findHtmlFiles.ts';

const outDir = path.resolve(process.cwd(), 'dist/client');

let warningsCount = 0;
let totalHtmlScanned = 0;
let totalHtmlChanged = 0;
let totalLinksFound = 0;
let totalLinksInlined = 0;
let totalPreloadsRemoved = 0;
let totalBytesInlined = 0;

async function fileExists(filePath: string): Promise<boolean> {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

async function resolveCssPath(
    htmlFile: string,
    href: string,
    baseHref: string | null,
): Promise<string | null> {
    if (/^https?:\/\//i.test(href)) {
        return null;
    }

    const cleanHref = href.split(/[?#]/, 1)[0];

    if (cleanHref.startsWith('/')) {
        const absoluteFromRoot = path.join(
            outDir,
            cleanHref.replace(/^\//, ''),
        );
        if (await fileExists(absoluteFromRoot)) return absoluteFromRoot;
    }

    if (baseHref && (baseHref === '/' || baseHref === './')) {
        const fromRoot = path.join(outDir, cleanHref.replace(/^\.\//, ''));
        if (await fileExists(fromRoot)) return fromRoot;
    }

    const relativeToHtml = path.resolve(path.dirname(htmlFile), cleanHref);
    if (await fileExists(relativeToHtml)) return relativeToHtml;

    const assetsFallback = path.join(
        outDir,
        'assets',
        path.basename(cleanHref),
    );
    if (await fileExists(assetsFallback)) return assetsFallback;

    const rootFallback = path.join(outDir, cleanHref.replace(/^\.\//, ''));
    if (await fileExists(rootFallback)) return rootFallback;

    return null;
}

async function inlineCss(): Promise<void> {
    console.log('\nCSS Inline: scanning dist/client for HTML...');

    const htmlFiles = await findHtmlFiles(outDir);
    totalHtmlScanned = htmlFiles.length;

    if (htmlFiles.length === 0) {
        console.warn('CSS Inline: no HTML files found.');
        return;
    }

    for (const file of htmlFiles) {
        const html = await fs.readFile(file, 'utf8');
        const dom = new JSDOM(html);
        const { document } = dom.window;
        let changed = false;

        const preloadLinks = document.querySelectorAll<HTMLLinkElement>(
            'link[rel="preload"][as="style"]',
        );
        totalPreloadsRemoved += preloadLinks.length;
        for (const preload of preloadLinks) {
            preload.remove();
            changed = true;
        }

        const baseHref =
            document.querySelector('base')?.getAttribute('href') ?? null;
        const stylesheetLinks = Array.from(
            document.querySelectorAll<HTMLLinkElement>(
                'link[rel="stylesheet"][href]',
            ),
        );

        if (stylesheetLinks.length === 0) {
            if (changed) {
                await fs.writeFile(file, dom.serialize(), 'utf8');
                totalHtmlChanged += 1;
            }
            continue;
        }

        totalLinksFound += stylesheetLinks.length;

        for (const link of stylesheetLinks) {
            const href = link.getAttribute('href');

            if (!href) {
                continue;
            }

            const cssPath = await resolveCssPath(file, href, baseHref);
            if (!cssPath) {
                console.warn(
                    `Could not locate CSS for "${href}" (from ${file})`,
                );
                warningsCount += 1;
                continue;
            }

            let css: string;
            try {
                css = await fs.readFile(cssPath, 'utf8');
            } catch {
                console.warn(`Could not read CSS at ${cssPath} (from ${file})`);
                warningsCount += 1;
                continue;
            }

            const style = document.createElement('style');
            const media = link.getAttribute('media');
            if (media) {
                style.setAttribute('media', media);
            }
            style.textContent = css;

            link.replaceWith(style);
            totalLinksInlined += 1;
            totalBytesInlined += Buffer.byteLength(css, 'utf8');
            changed = true;
        }

        if (changed) {
            await fs.writeFile(file, dom.serialize(), 'utf8');
            totalHtmlChanged += 1;
        }
    }

    console.log('CSS Inline complete.\n');
    console.log('Summary:');
    console.log(`  HTML files scanned:   ${totalHtmlScanned.toString()}`);
    console.log(`  HTML files changed:   ${totalHtmlChanged.toString()}`);
    console.log(`  Stylesheets found:    ${totalLinksFound.toString()}`);
    console.log(`  Stylesheets inlined:  ${totalLinksInlined.toString()}`);
    console.log(`  Preloads removed:     ${totalPreloadsRemoved.toString()}`);
    console.log(
        `  KB inlined:           ${(totalBytesInlined / 1024).toFixed(1)}`,
    );
    if (warningsCount > 0) {
        console.log(`  Warnings:             ${warningsCount.toString()}`);
    }
}

void inlineCss().catch((error: unknown) => {
    console.error(
        'CSS Inline: failed:',
        error instanceof Error ? error.message : String(error),
    );
    process.exit(1);
});
