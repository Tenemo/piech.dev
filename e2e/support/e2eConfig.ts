const DEFAULT_E2E_HOST = '127.0.0.1';
const DEFAULT_E2E_PORT = 4173;

function parseE2ePort(rawPort: string | undefined): number {
    if (rawPort === undefined || rawPort === '') {
        return DEFAULT_E2E_PORT;
    }

    const parsedPort = Number(rawPort);

    if (
        !Number.isFinite(parsedPort) ||
        !Number.isInteger(parsedPort) ||
        parsedPort < 1 ||
        parsedPort > 65535
    ) {
        throw new Error(
            `Invalid PORT value "${rawPort}". Expected an integer between 1 and 65535.`,
        );
    }

    return parsedPort;
}

function parseRemoteBaseUrl(
    rawBaseUrl: string | undefined,
): string | undefined {
    if (rawBaseUrl === undefined || rawBaseUrl === '') {
        return undefined;
    }

    let parsedUrl: URL;

    try {
        parsedUrl = new URL(rawBaseUrl);
    } catch {
        throw new Error(
            `Invalid PLAYWRIGHT_BASE_URL value "${rawBaseUrl}". Expected an absolute http(s) URL.`,
        );
    }

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        throw new Error(
            `Invalid PLAYWRIGHT_BASE_URL value "${rawBaseUrl}". Expected an http(s) URL.`,
        );
    }

    if (
        parsedUrl.pathname !== '/' ||
        parsedUrl.search !== '' ||
        parsedUrl.hash !== ''
    ) {
        throw new Error(
            `Invalid PLAYWRIGHT_BASE_URL value "${rawBaseUrl}". Expected a site origin without path, search, or hash.`,
        );
    }

    return parsedUrl.origin;
}

export const E2E_HOST = DEFAULT_E2E_HOST;
export const E2E_PORT = parseE2ePort(process.env.PORT);
export const REMOTE_E2E_BASE_URL = parseRemoteBaseUrl(
    process.env.PLAYWRIGHT_BASE_URL,
);
export const SHOULD_USE_REMOTE_E2E = REMOTE_E2E_BASE_URL !== undefined;
export const E2E_BASE_URL =
    REMOTE_E2E_BASE_URL ?? `http://${E2E_HOST}:${String(E2E_PORT)}`;
