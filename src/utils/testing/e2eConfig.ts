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

export const E2E_HOST = DEFAULT_E2E_HOST;
export const E2E_PORT = parseE2ePort(process.env.PORT);
export const E2E_BASE_URL = `http://${E2E_HOST}:${String(E2E_PORT)}`;
