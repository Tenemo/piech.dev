import { createHash, createHmac } from 'node:crypto';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { handler } from './trigger-production-e2e';

function createNetlifySignature(body: string, secret: string): string {
    const encodedHeader = Buffer.from(
        JSON.stringify({
            alg: 'HS256',
            typ: 'JWT',
        }),
    ).toString('base64url');
    const encodedPayload = Buffer.from(
        JSON.stringify({
            iss: 'netlify',
            sha256: createHash('sha256').update(body).digest('hex'),
        }),
    ).toString('base64url');
    const encodedSignature = createHmac('sha256', secret)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest('base64url');

    return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

describe('trigger-production-e2e Netlify function', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllEnvs();
    });

    it('dispatches the production workflow for a verified production deploy', async () => {
        const secret = 'super-secret-token';
        const body = JSON.stringify({
            branch: 'master',
            context: 'production',
            deploy_url: 'https://65b.example.netlify.app',
            id: 'deploy-123',
            ssl_url: 'https://piech.dev',
        });
        const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue(
            new Response(
                JSON.stringify({
                    html_url:
                        'https://github.com/Tenemo/piech.dev/actions/runs/123456789',
                }),
                {
                    status: 200,
                },
            ),
        );

        vi.stubEnv('PRODUCTION_E2E_GITHUB_TOKEN', 'github-token');
        vi.stubEnv('PRODUCTION_E2E_WEBHOOK_SECRET', secret);

        const response = await handler({
            body,
            headers: {
                'x-webhook-signature': createNetlifySignature(body, secret),
            },
            httpMethod: 'POST',
        });

        expect(response.statusCode).toBe(202);
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock.mock.calls[0]?.[0]).toBeInstanceOf(URL);
        expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
            method: 'POST',
        });
        expect(response.body).toContain('"dispatched":true');
    });

    it('skips deploy notifications that are not production publishes', async () => {
        const secret = 'super-secret-token';
        const body = JSON.stringify({
            branch: 'feature/something',
            context: 'deploy-preview',
            deploy_url: 'https://deploy-preview-99--piech-dev.netlify.app',
            id: 'deploy-456',
            ssl_url: 'https://deploy-preview-99--piech-dev.netlify.app',
        });
        const fetchMock = vi.spyOn(global, 'fetch');

        vi.stubEnv('PRODUCTION_E2E_GITHUB_TOKEN', 'github-token');
        vi.stubEnv('PRODUCTION_E2E_WEBHOOK_SECRET', secret);

        const response = await handler({
            body,
            headers: {
                'x-webhook-signature': createNetlifySignature(body, secret),
            },
            httpMethod: 'POST',
        });

        expect(response.statusCode).toBe(202);
        expect(fetchMock).not.toHaveBeenCalled();
        expect(response.body).toContain('"skipped":true');
    });
});
