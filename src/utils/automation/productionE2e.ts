import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

type JsonRecord = Record<string, unknown>;

export type NetlifyDeployMetadata = {
    branch: string;
    context: string;
    deployId: string;
    deployUrl: string;
    publishedUrl: string;
};

export type ProductionDeployMatchOptions = {
    requiredBranch: string;
    requiredContext: string;
    targetUrl: string;
};

export type WorkflowDispatchInputs = {
    base_url: string;
    deploy_branch: string;
    deploy_context: string;
    deploy_id: string;
    deploy_url: string;
    published_url: string;
};

export type WorkflowDispatchPayload = {
    inputs: WorkflowDispatchInputs;
    ref: string;
};

function isJsonRecord(value: unknown): value is JsonRecord {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(
    source: JsonRecord,
    keys: readonly string[],
    fallback = '',
): string {
    for (const key of keys) {
        const value = source[key];

        if (typeof value === 'string' && value !== '') {
            return value;
        }
    }

    return fallback;
}

function normalizeComparableValue(value: string): string {
    return value.trim().toLowerCase();
}

function normalizeOrigin(url: string): string | null {
    try {
        return new URL(url).origin.toLowerCase();
    } catch {
        return null;
    }
}

function decodeBase64UrlJson(value: string): JsonRecord | null {
    try {
        const decoded = Buffer.from(value, 'base64url').toString('utf8');
        const parsed: unknown = JSON.parse(decoded);

        return isJsonRecord(parsed) ? parsed : null;
    } catch {
        return null;
    }
}

export function parseGitHubRepository(repository: string): {
    owner: string;
    repo: string;
} {
    const segments = repository.split('/');

    if (segments.length !== 2) {
        throw new Error(
            `Invalid GitHub repository "${repository}". Expected "owner/repo".`,
        );
    }

    const [owner, repo] = segments;

    if (owner.trim() === '' || repo.trim() === '') {
        throw new Error(
            `Invalid GitHub repository "${repository}". Expected "owner/repo".`,
        );
    }

    return {
        owner: owner.trim(),
        repo: repo.trim(),
    };
}

export function verifyNetlifyWebhookSignature({
    body,
    secret,
    signature,
}: {
    body: string;
    secret: string;
    signature: string;
}): boolean {
    const segments = signature.split('.');

    if (segments.length !== 3) {
        return false;
    }

    const [encodedHeader, encodedPayload, encodedSignature] = segments;

    const header = decodeBase64UrlJson(encodedHeader);
    const payload = decodeBase64UrlJson(encodedPayload);

    if (!header || !payload) {
        return false;
    }

    if (
        normalizeComparableValue(readString(header, ['alg'])) !== 'hs256' ||
        normalizeComparableValue(readString(payload, ['iss'])) !== 'netlify'
    ) {
        return false;
    }

    const expectedSignature = createHmac('sha256', secret)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest('base64url');
    const expectedSignatureBuffer = Buffer.from(expectedSignature, 'utf8');
    const actualSignatureBuffer = Buffer.from(encodedSignature, 'utf8');

    if (
        expectedSignatureBuffer.length !== actualSignatureBuffer.length ||
        !timingSafeEqual(expectedSignatureBuffer, actualSignatureBuffer)
    ) {
        return false;
    }

    const bodyHash = createHash('sha256').update(body).digest('hex');

    return bodyHash === readString(payload, ['sha256']);
}

export function extractNetlifyDeployMetadata(
    payload: unknown,
): NetlifyDeployMetadata | null {
    if (!isJsonRecord(payload)) {
        return null;
    }

    return {
        branch: readString(payload, ['branch']),
        context: readString(payload, ['context', 'deploy_context']),
        deployId: readString(payload, ['id', 'deploy_id']),
        deployUrl: readString(payload, ['deploy_ssl_url', 'deploy_url']),
        publishedUrl: readString(payload, ['ssl_url', 'url']),
    };
}

export function isMatchingProductionDeploy(
    metadata: NetlifyDeployMetadata,
    options: ProductionDeployMatchOptions,
): boolean {
    const requiredBranch = normalizeComparableValue(options.requiredBranch);
    const requiredContext = normalizeComparableValue(options.requiredContext);
    const targetOrigin = normalizeOrigin(options.targetUrl);
    const publishedOrigin = normalizeOrigin(metadata.publishedUrl);

    if (
        normalizeComparableValue(metadata.branch) !== requiredBranch ||
        normalizeComparableValue(metadata.context) !== requiredContext
    ) {
        return false;
    }

    if (!targetOrigin || !publishedOrigin) {
        return false;
    }

    return publishedOrigin === targetOrigin;
}

export function buildWorkflowDispatchPayload({
    baseUrl,
    deployMetadata,
    ref,
}: {
    baseUrl: string;
    deployMetadata: NetlifyDeployMetadata;
    ref: string;
}): WorkflowDispatchPayload {
    return {
        inputs: {
            base_url: baseUrl,
            deploy_branch: deployMetadata.branch,
            deploy_context: deployMetadata.context,
            deploy_id: deployMetadata.deployId,
            deploy_url: deployMetadata.deployUrl,
            published_url: deployMetadata.publishedUrl,
        },
        ref,
    };
}
