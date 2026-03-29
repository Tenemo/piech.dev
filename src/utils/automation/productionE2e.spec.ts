import { createHash, createHmac } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import {
    buildRepositoryDispatchPayload,
    extractNetlifyDeployMetadata,
    isMatchingProductionDeploy,
    parseGitHubRepository,
    PRODUCTION_E2E_REPOSITORY_DISPATCH_EVENT,
    verifyNetlifyWebhookSignature,
} from './productionE2e';

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

describe('production E2E automation helpers', () => {
    it('verifies a valid Netlify webhook signature', () => {
        const body = JSON.stringify({
            branch: 'master',
            context: 'production',
            deploy_url: 'https://65b.example.netlify.app',
            id: 'deploy-123',
            ssl_url: 'https://piech.dev',
        });
        const secret = 'super-secret-token';
        const signature = createNetlifySignature(body, secret);

        expect(
            verifyNetlifyWebhookSignature({
                body,
                secret,
                signature,
            }),
        ).toBe(true);
    });

    it('rejects a Netlify webhook signature when the body was changed', () => {
        const originalBody = JSON.stringify({
            branch: 'master',
            context: 'production',
        });
        const secret = 'super-secret-token';
        const signature = createNetlifySignature(originalBody, secret);

        expect(
            verifyNetlifyWebhookSignature({
                body: `${originalBody} `,
                secret,
                signature,
            }),
        ).toBe(false);
    });

    it('extracts production deploy metadata from a Netlify payload', () => {
        expect(
            extractNetlifyDeployMetadata({
                branch: 'master',
                context: 'production',
                deploy_url: 'https://65b.example.netlify.app',
                id: 'deploy-123',
                ssl_url: 'https://piech.dev',
            }),
        ).toEqual({
            branch: 'master',
            context: 'production',
            deployId: 'deploy-123',
            deployUrl: 'https://65b.example.netlify.app',
            publishedUrl: 'https://piech.dev',
        });
    });

    it('matches only production deploys published to the expected site URL', () => {
        expect(
            isMatchingProductionDeploy(
                {
                    branch: 'master',
                    context: 'production',
                    deployId: 'deploy-123',
                    deployUrl: 'https://65b.example.netlify.app',
                    publishedUrl: 'https://piech.dev',
                },
                {
                    requiredBranch: 'master',
                    requiredContext: 'production',
                    targetUrl: 'https://piech.dev/',
                },
            ),
        ).toBe(true);

        expect(
            isMatchingProductionDeploy(
                {
                    branch: 'deploy-preview',
                    context: 'deploy-preview',
                    deployId: 'deploy-456',
                    deployUrl:
                        'https://deploy-preview-456--piech-dev.netlify.app',
                    publishedUrl:
                        'https://deploy-preview-456--piech-dev.netlify.app',
                },
                {
                    requiredBranch: 'master',
                    requiredContext: 'production',
                    targetUrl: 'https://piech.dev/',
                },
            ),
        ).toBe(false);
    });

    it('builds the GitHub repository dispatch payload from deploy metadata', () => {
        expect(
            buildRepositoryDispatchPayload({
                baseUrl: 'https://piech.dev',
                deployMetadata: {
                    branch: 'master',
                    context: 'production',
                    deployId: 'deploy-123',
                    deployUrl: 'https://65b.example.netlify.app',
                    publishedUrl: 'https://piech.dev',
                },
            }),
        ).toEqual({
            client_payload: {
                base_url: 'https://piech.dev',
                deploy_branch: 'master',
                deploy_context: 'production',
                deploy_id: 'deploy-123',
                deploy_url: 'https://65b.example.netlify.app',
                published_url: 'https://piech.dev',
            },
            event_type: PRODUCTION_E2E_REPOSITORY_DISPATCH_EVENT,
        });
    });

    it('parses a GitHub owner/repo string', () => {
        expect(parseGitHubRepository('Tenemo/piech.dev')).toEqual({
            owner: 'Tenemo',
            repo: 'piech.dev',
        });

        expect(() => parseGitHubRepository('Tenemo')).toThrow(
            /Expected "owner\/repo"/,
        );
    });
});
