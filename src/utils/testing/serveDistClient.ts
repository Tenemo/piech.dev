import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const DIST_ROOT = path.resolve(process.cwd(), 'dist', 'client');
const HOST = '127.0.0.1';
const PORT = Number(process.env.PORT ?? '4173');
const SERVER_ORIGIN = `http://${HOST}:${String(PORT)}`;

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

function resolveRequestPath(requestUrl: string | undefined): string {
    const url = new URL(requestUrl ?? '/', SERVER_ORIGIN);
    const relativePath = url.pathname.replace(/^\/+/, '');
    const candidatePath = path.normalize(path.join(DIST_ROOT, relativePath));

    if (
        candidatePath !== DIST_ROOT &&
        !candidatePath.startsWith(`${DIST_ROOT}${path.sep}`)
    ) {
        throw new Error('Forbidden path traversal attempt.');
    }

    let filePath = candidatePath;
    // Path traversal is checked above, so the remaining filesystem access is constrained to dist/client.
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const pathExists = fs.existsSync(filePath);

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    if (pathExists && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
    } else if (!pathExists && path.extname(filePath) === '') {
        filePath = path.join(filePath, 'index.html');
    }

    return filePath;
}

function getContentType(filePath: string): string {
    return (
        MIME_TYPES.get(path.extname(filePath).toLowerCase()) ??
        'application/octet-stream'
    );
}

const server = http.createServer((request, response) => {
    if (
        request.method !== undefined &&
        request.method !== 'GET' &&
        request.method !== 'HEAD'
    ) {
        response.writeHead(405, { Allow: 'GET, HEAD' });
        response.end('Method not allowed');
        return;
    }

    try {
        const filePath = resolveRequestPath(request.url);
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        const fileContent = fs.readFileSync(filePath);

        response.writeHead(200, {
            'Content-Type': getContentType(filePath),
        });

        if (request.method === 'HEAD') {
            response.end();
            return;
        }

        response.end(fileContent);
    } catch (error) {
        const statusCode =
            error instanceof Error &&
            error.message === 'Forbidden path traversal attempt.'
                ? 403
                : 404;

        response.writeHead(statusCode, {
            'Content-Type': 'text/plain; charset=utf-8',
        });
        response.end(statusCode === 403 ? 'Forbidden' : 'Not found');
    }
});

server.listen(PORT, HOST, () => {
    console.log(`Serving dist/client at ${SERVER_ORIGIN}`);
});

const shutdown = (): void => {
    server.close(() => {
        process.exit(0);
    });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
