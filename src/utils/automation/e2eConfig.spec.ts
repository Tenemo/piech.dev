import { afterEach, describe, expect, it, vi } from 'vitest';

async function loadE2eConfig(): Promise<
    typeof import('e2e/support/e2eConfig')
> {
    vi.resetModules();
    return import('e2e/support/e2eConfig');
}

describe('E2E config', () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it('defaults to the local preview server when no remote URL is configured', async () => {
        vi.stubEnv('PLAYWRIGHT_BASE_URL', '');
        vi.stubEnv('PORT', '');

        const config = await loadE2eConfig();

        expect(config.SHOULD_USE_REMOTE_E2E).toBe(false);
        expect(config.E2E_BASE_URL).toBe('http://127.0.0.1:4173');
    });

    it('uses a validated remote origin when PLAYWRIGHT_BASE_URL is set', async () => {
        vi.stubEnv('PLAYWRIGHT_BASE_URL', 'https://piech.dev/');
        vi.stubEnv('PORT', '');

        const config = await loadE2eConfig();

        expect(config.SHOULD_USE_REMOTE_E2E).toBe(true);
        expect(config.E2E_BASE_URL).toBe('https://piech.dev');
    });

    it('rejects remote URLs with a path or query string', async () => {
        vi.stubEnv('PLAYWRIGHT_BASE_URL', 'https://piech.dev/projects/?foo=1');
        vi.stubEnv('PORT', '');

        await expect(loadE2eConfig()).rejects.toThrow(
            /Expected a site origin without path, search, or hash/,
        );
    });
});
