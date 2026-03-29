import {
    buildWorkflowDispatchPayload,
    extractNetlifyDeployMetadata,
    isMatchingProductionDeploy,
    parseGitHubRepository,
    verifyNetlifyWebhookSignature,
} from '../../src/utils/automation/productionE2e';

type NetlifyFunctionEvent = {
    body?: string | null;
    headers?: Record<string, string | undefined>;
    httpMethod?: string;
    isBase64Encoded?: boolean;
};

type NetlifyFunctionResponse = {
    body: string;
    headers?: Record<string, string>;
    statusCode: number;
};

type JsonResponseBody = Record<string, string | boolean>;

function jsonResponse(
    statusCode: number,
    body: JsonResponseBody,
    headers?: Record<string, string>,
): NetlifyFunctionResponse {
    return {
        body: JSON.stringify(body),
        headers: {
            'content-type': 'application/json; charset=utf-8',
            ...headers,
        },
        statusCode,
    };
}

function getEnv(name: string, fallback?: string): string {
    const value = process.env[name];

    if (value !== undefined && value !== '') {
        return value;
    }

    if (fallback !== undefined) {
        return fallback;
    }

    throw new Error(`Missing required environment variable ${name}.`);
}

function getHeader(
    headers: Record<string, string | undefined> | undefined,
    name: string,
): string | undefined {
    if (!headers) {
        return undefined;
    }

    const normalizedName = name.toLowerCase();

    for (const [headerName, value] of Object.entries(headers)) {
        if (headerName.toLowerCase() === normalizedName && value) {
            return value;
        }
    }

    return undefined;
}

function decodeEventBody(event: NetlifyFunctionEvent): string {
    const rawBody = event.body ?? '';

    if (rawBody === '') {
        return '';
    }

    return event.isBase64Encoded
        ? Buffer.from(rawBody, 'base64').toString('utf8')
        : rawBody;
}

export const handler = async (
    event: NetlifyFunctionEvent,
): Promise<NetlifyFunctionResponse> => {
    if (event.httpMethod !== 'POST') {
        return jsonResponse(
            405,
            {
                error: 'Method not allowed.',
            },
            {
                Allow: 'POST',
            },
        );
    }

    const rawBody = decodeEventBody(event);

    if (rawBody === '') {
        return jsonResponse(400, {
            error: 'Missing request body.',
        });
    }

    const signature = getHeader(event.headers, 'x-webhook-signature');

    if (!signature) {
        return jsonResponse(401, {
            error: 'Missing Netlify webhook signature.',
        });
    }

    try {
        const webhookSecret = getEnv('PRODUCTION_E2E_WEBHOOK_SECRET');

        if (
            !verifyNetlifyWebhookSignature({
                body: rawBody,
                secret: webhookSecret,
                signature,
            })
        ) {
            return jsonResponse(403, {
                error: 'Invalid Netlify webhook signature.',
            });
        }

        let payload: unknown;

        try {
            payload = JSON.parse(rawBody) as unknown;
        } catch {
            return jsonResponse(400, {
                error: 'Request body is not valid JSON.',
            });
        }

        const deployMetadata = extractNetlifyDeployMetadata(payload);

        if (!deployMetadata) {
            return jsonResponse(400, {
                error: 'Request body is not a Netlify deploy payload.',
            });
        }

        const targetUrl = getEnv(
            'PRODUCTION_E2E_TARGET_URL',
            'https://piech.dev',
        );
        const requiredContext = getEnv(
            'PRODUCTION_E2E_REQUIRED_CONTEXT',
            'production',
        );
        const requiredBranch = getEnv(
            'PRODUCTION_E2E_REQUIRED_BRANCH',
            'master',
        );

        if (
            !isMatchingProductionDeploy(deployMetadata, {
                requiredBranch,
                requiredContext,
                targetUrl,
            })
        ) {
            return jsonResponse(202, {
                context: deployMetadata.context,
                deploy_branch: deployMetadata.branch,
                deploy_id: deployMetadata.deployId || 'unknown',
                skipped: true,
            });
        }

        const repository = parseGitHubRepository(
            getEnv('PRODUCTION_E2E_GITHUB_REPOSITORY', 'Tenemo/piech.dev'),
        );
        const workflowFile = getEnv(
            'PRODUCTION_E2E_GITHUB_WORKFLOW',
            'production-e2e.yml',
        );
        const githubToken = getEnv('PRODUCTION_E2E_GITHUB_TOKEN');
        const dispatchRef = getEnv('PRODUCTION_E2E_GITHUB_REF', requiredBranch);
        const dispatchPayload = buildWorkflowDispatchPayload({
            baseUrl: targetUrl,
            deployMetadata,
            ref: dispatchRef,
        });
        const dispatchUrl = new URL(
            `https://api.github.com/repos/${repository.owner}/${repository.repo}/actions/workflows/${encodeURIComponent(workflowFile)}/dispatches`,
        );

        dispatchUrl.searchParams.set('return_run_details', 'true');

        const dispatchResponse = await fetch(dispatchUrl, {
            body: JSON.stringify(dispatchPayload),
            headers: {
                Accept: 'application/vnd.github+json',
                Authorization: `Bearer ${githubToken}`,
                'Content-Type': 'application/json; charset=utf-8',
                'X-GitHub-Api-Version': '2026-03-10',
            },
            method: 'POST',
        });

        if (!dispatchResponse.ok) {
            const errorBody = await dispatchResponse.text();

            return jsonResponse(502, {
                details:
                    errorBody ||
                    `GitHub returned ${String(dispatchResponse.status)}.`,
                error: 'Failed to dispatch the production E2E workflow.',
            });
        }

        const dispatchResult = (await dispatchResponse
            .json()
            .catch(() => undefined)) as
            | {
                  html_url?: string;
              }
            | undefined;

        return jsonResponse(202, {
            dispatched: true,
            run_url: dispatchResult?.html_url ?? '',
        });
    } catch (error) {
        return jsonResponse(500, {
            details: error instanceof Error ? error.message : String(error),
            error: 'Failed to process the Netlify deploy notification.',
        });
    }
};
