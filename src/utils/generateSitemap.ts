// vite-plugin-sitemap doesn't work with URLs with dots,
// cuts off /piech.dev and aliases.sh to /piech and /aliases

import 'dotenv/config';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';

import { SitemapStream, streamToPromise } from 'sitemap';

// Minimal type for the link items we push into the sitemap stream.
// Avoid importing non-existent types from 'sitemap' across versions.
type SitemapLink = {
    url: string;
    lastmod?: Date | string;
    changefreq?:
        | 'always'
        | 'hourly'
        | 'daily'
        | 'weekly'
        | 'monthly'
        | 'yearly'
        | 'never';
    priority?: number;
};

const OUT_DIR = path.resolve('dist/client');

const SITE_URL = 'https://piech.dev'.replace(/\/+$/, '');

const IGNORE_FILE_NAMES = new Set(['404.html', '__spa-fallback.html']);

async function getHtmlFiles(dir: string): Promise<string[]> {
    // Dynamic path is expected here; safe in our controlled build output directory.
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const found: string[] = [];
    for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name === 'assets') continue; // ignore asset folder
            found.push(...(await getHtmlFiles(full)));
        } else if (
            entry.isFile() &&
            entry.name.endsWith('.html') &&
            !IGNORE_FILE_NAMES.has(entry.name)
        ) {
            found.push(full);
        }
    }
    return found;
}

// Convert "dist/client/foo/index.html" -> "/foo/"
// Convert "dist/client/bar.html" -> "/bar"
function toRoute(fromDir: string, file: string): string {
    const rel = path.relative(fromDir, file).split(path.sep).join('/'); // POSIX style
    if (rel === 'index.html') return '/';
    if (rel.endsWith('/index.html'))
        return `/${rel.slice(0, -'index.html'.length)}`;
    return `/${rel.replace(/\.html$/, '')}`;
}

async function main(): Promise<void> {
    // Ensure build exists
    await fs.access(OUT_DIR);

    const files = await getHtmlFiles(OUT_DIR);

    const links: SitemapLink[] = [];
    for (const file of files) {
        const url = toRoute(OUT_DIR, file);

        // skip internal/temporary routes if any slipped through
        if (url.includes('/__') || url.includes('/_internal')) continue;

        // Dynamic path is expected in our build output.
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        const stat = await fs.stat(file);
        links.push({
            url,
            lastmod: stat.mtime, // Date is accepted
            // small, sensible defaults
            changefreq: url === '/' ? 'weekly' : 'monthly',
            priority:
                url === '/'
                    ? 1.0
                    : url.split('/').filter(Boolean).length === 1
                      ? 0.8
                      : 0.6,
        });
    }

    const sm = new SitemapStream({ hostname: SITE_URL });
    const xml = (
        await streamToPromise(Readable.from(links).pipe(sm))
    ).toString();

    const outFile = path.join(OUT_DIR, 'sitemap.xml');
    await fs.writeFile(outFile, xml, 'utf8');
    // Avoid non-string interpolation per eslint rule
    console.log(
        `sitemap.xml written (${String(links.length)} URLs): ${outFile}`,
    );
}

main().catch((err: unknown) => {
    console.error('sitemap generation failed:', err);
    process.exitCode = 1;
});
