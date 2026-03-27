import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

import { E2E_BASE_URL, E2E_HOST, E2E_PORT } from './e2eConfig.ts';

const DIST_ROOT = path.resolve(process.cwd(), 'dist', 'client');
const MIME_TYPES = new Map<string, string>([
    ['.css', 'text/css; charset=utf-8'],
    ['.html', 'text/html; charset=utf-8'],
    ['.ico', 'image/x-icon'],
    ['.jpeg', 'image/jpeg'],
    ['.jpg', 'image/jpeg'],
    ['.json', 'application/json; charset=utf-8'],
    ['.mp4', 'video/mp4'],
    ['.png', 'image/png'],
    ['.svg', 'image/svg+xml'],
    ['.txt', 'text/plain; charset=utf-8'],
    ['.vtt', 'text/vtt; charset=utf-8'],
    ['.webm', 'video/webm'],
    ['.webmanifest', 'application/manifest+json; charset=utf-8'],
    ['.webp', 'image/webp'],
    ['.xml', 'application/xml; charset=utf-8'],
]);

function resolveDistPath(relativePath: string): string {
    const candidatePath = path.normalize(path.join(DIST_ROOT, relativePath));

    if (
        candidatePath !== DIST_ROOT &&
        !candidatePath.startsWith(`${DIST_ROOT}${path.sep}`)
    ) {
        throw new Error('Forbidden path traversal attempt.');
    }

    return candidatePath;
}

function toFilePath(candidatePath: string): string {
    let filePath = candidatePath;
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
    } else if (
        !path.extname(filePath) ||
        (!fs.existsSync(filePath) &&
            fs.existsSync(path.join(filePath, 'index.html')))
    ) {
        filePath = path.join(filePath, 'index.html');
    }

    return filePath;
}

function resolveNetlifyImagePath(url: URL): string {
    const sourceAssetUrl = url.searchParams.get('url');

    if (!sourceAssetUrl) {
        throw new Error('Missing Netlify image source URL.');
    }

    const resolvedSourceUrl = new URL(sourceAssetUrl, E2E_BASE_URL);

    if (resolvedSourceUrl.origin !== E2E_BASE_URL) {
        throw new Error('External Netlify image URLs are not supported.');
    }

    return toFilePath(resolveDistPath(resolvedSourceUrl.pathname.slice(1)));
}

function resolveRequestPath(requestUrl: string | undefined): string {
    const url = new URL(requestUrl ?? '/', E2E_BASE_URL);

    if (url.pathname === '/.netlify/images') {
        return resolveNetlifyImagePath(url);
    }

    return toFilePath(resolveDistPath(url.pathname.replace(/^\/+/, '')));
}

function send404(response: http.ServerResponse): void {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Not found');
}

const server = http.createServer((request, response) => {
    let filePath: string;

    try {
        filePath = resolveRequestPath(request.url);
    } catch {
        response.writeHead(400, {
            'content-type': 'text/plain; charset=utf-8',
        });
        response.end('Bad request');
        return;
    }

    try {
        if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
            send404(response);
            return;
        }

        const extension = path.extname(filePath).toLowerCase();
        const contentType =
            MIME_TYPES.get(extension) ?? 'application/octet-stream';

        response.writeHead(200, {
            'cache-control': 'no-store',
            'content-type': contentType,
        });

        const stream = fs.createReadStream(filePath);

        stream.on('error', () => {
            response.writeHead(500, {
                'content-type': 'text/plain; charset=utf-8',
            });
            response.end('Internal server error');
        });

        stream.pipe(response);
    } catch {
        response.writeHead(500, {
            'content-type': 'text/plain; charset=utf-8',
        });
        response.end('Internal server error');
    }
});

server.listen(E2E_PORT, E2E_HOST, () => {
    console.log(`E2E server running at ${E2E_BASE_URL}`);
});
