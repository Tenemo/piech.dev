// src/utils/inlineCss.ts
import { promises as fs } from 'fs';
import path from 'path';

const outDir = path.resolve(process.cwd(), 'dist/client');

let warningsCount = 0;
let totalHtmlScanned = 0;
let totalHtmlChanged = 0;
let totalLinksFound = 0;
let totalLinksInlined = 0;
let totalPreloadsRemoved = 0;
let totalBytesInlined = 0;

// Simple existence check
async function fileExists(p: string): Promise<boolean> {
    try {
        await fs.access(p);
        return true;
    } catch {
        return false;
    }
}

// Recursively find HTML files
async function findHtmlFiles(dir: string): Promise<string[]> {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const dirents = await fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
        dirents.map((d) => {
            const p = path.resolve(dir, d.name);
            return d.isDirectory()
                ? findHtmlFiles(p)
                : p.endsWith('.html')
                  ? p
                  : null;
        }),
    );
    return files.flat().filter(Boolean) as string[];
}

// Pull href + media off each <link rel="stylesheet" ...>
function parseStylesheetLinks(
    html: string,
): { full: string; href: string; media?: string }[] {
    // eslint-disable-next-line security/detect-unsafe-regex
    const linkRe = /<link\s+([^>]*\s)?rel=(?:"|')stylesheet(?:"|')([^>]*)>/gi;
    const hrefRe = /href=(?:"|')([^"']+)(?:"|')/i;
    const mediaRe = /media=(?:"|')([^"']+)(?:"|')/i;

    const matches: { full: string; href: string; media?: string }[] = [];
    let m: RegExpExecArray | null;
    while ((m = linkRe.exec(html))) {
        const full = m[0];
        const attrs = m[1] + m[2];
        const href = hrefRe.exec(full)?.[1] ?? hrefRe.exec(attrs)?.[1];
        if (!href) continue;
        const media = mediaRe.exec(full)?.[1] ?? mediaRe.exec(attrs)?.[1];
        matches.push({ full, href, media });
    }
    return matches;
}

// Read <base href="..."> if present
function getBaseHref(html: string): string | null {
    const m = /<base\s+[^>]*href=(?:"|')([^"']+)(?:"|')[^>]*>/i.exec(html);
    return m?.[1] ?? null;
}

// Resolve CSS path on disk considering <base href> and common Vite output
async function resolveCssPath(
    htmlFile: string,
    href: string,
    baseHref: string | null,
): Promise<string | null> {
    // Ignore external URLs
    if (/^https?:\/\//i.test(href)) return null;

    const cleanHref = href.split(/[?#]/, 1)[0];

    // 1) Absolute-from-root hrefs ("/assets/..."): map to dist/client/...
    if (cleanHref.startsWith('/')) {
        const p = path.join(outDir, cleanHref.replace(/^\//, ''));
        if (await fileExists(p)) return p;
    }

    // 2) If <base href="/"> (or "./"), treat non-absolute hrefs as from outDir root
    if (baseHref && (baseHref === '/' || baseHref === './')) {
        const fromRoot = path.join(outDir, cleanHref.replace(/^\.\//, ''));
        if (await fileExists(fromRoot)) return fromRoot;
    }

    // 3) Resolve relative to the HTML file’s folder
    const relative = path.resolve(path.dirname(htmlFile), cleanHref);
    if (await fileExists(relative)) return relative;

    // 4) Fallback for common Vite pattern: everything ends up in dist/client/assets
    const assetsFallback = path.join(
        outDir,
        'assets',
        path.basename(cleanHref),
    );
    if (await fileExists(assetsFallback)) return assetsFallback;

    // 5) Last resort: try from outDir root
    const rootTry = path.join(outDir, cleanHref.replace(/^\.\//, ''));
    if (await fileExists(rootTry)) return rootTry;

    return null;
}

async function inlineCss(): Promise<void> {
    console.log('\nCSS Inline: scanning dist/client for HTML…');

    const htmlFiles = await findHtmlFiles(outDir);
    totalHtmlScanned = htmlFiles.length;

    if (htmlFiles.length === 0) {
        console.warn('CSS Inline: no HTML files found.');
        return;
    }

    for (const file of htmlFiles) {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        let html = await fs.readFile(file, 'utf8');
        let changed = false;

        // Drop <link rel="preload" as="style" …> since we’ll inline anyway
        const preloadRe =
            /<link[^>]+rel=(?:"|')preload(?:"|')[^>]+as=(?:"|')style(?:"|')[^>]*>\s*/gi;
        const preloadMatches = html.match(preloadRe)?.length ?? 0;
        if (preloadMatches > 0) {
            html = html.replace(preloadRe, '');
            totalPreloadsRemoved += preloadMatches;
            changed = true;
        }

        const baseHref = getBaseHref(html);
        const links = parseStylesheetLinks(html);
        if (links.length === 0) {
            continue;
        }
        totalLinksFound += links.length;

        for (const { full, href, media } of links) {
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
                // eslint-disable-next-line security/detect-non-literal-fs-filename
                css = await fs.readFile(cssPath, 'utf8');
            } catch {
                console.warn(`Could not read CSS at ${cssPath} (from ${file})`);
                warningsCount += 1;

                continue;
            }

            const mediaAttr = media ? ` media="${media}"` : '';
            const styleTag = `<style${mediaAttr}>${css}</style>`;

            const newHtml = html.replace(full, styleTag);
            if (newHtml !== html) {
                html = newHtml;
                changed = true;
                totalLinksInlined += 1;
                totalBytesInlined += Buffer.byteLength(css, 'utf8');
            }
        }

        if (changed) {
            // eslint-disable-next-line security/detect-non-literal-fs-filename
            await fs.writeFile(file, html, 'utf8');
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

void inlineCss().catch((e: unknown) => {
    console.error(
        'CSS Inline: failed:',
        e instanceof Error ? e.message : String(e),
    );
    process.exit(1);
});
