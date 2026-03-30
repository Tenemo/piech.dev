import { isGithubUserAttachmentUrl } from '../githubUrls.ts';

export type ResourceKind =
    | 'document'
    | 'image'
    | 'manifest'
    | 'media'
    | 'style';

type AllowedOriginPattern = 'data:' | 'self' | `https://${string}`;

const SITE_ORIGIN = 'https://piech.dev';
const BADGE_FURY_RUNTIME_ORIGIN = 'https://d25lcipzij17d.cloudfront.net';
const GITHUB_USER_ATTACHMENT_RUNTIME_ORIGIN =
    'https://github-production-user-asset-6210df.s3.amazonaws.com';
const ALLOWED_ORIGIN_PATTERNS: Record<
    ResourceKind,
    readonly AllowedOriginPattern[]
> = {
    document: ['self'],
    image: [
        'self',
        'data:',
        'https://api.netlify.com',
        'https://badge.fury.io',
        BADGE_FURY_RUNTIME_ORIGIN,
        'https://github.com',
        'https://raw.githubusercontent.com',
        GITHUB_USER_ATTACHMENT_RUNTIME_ORIGIN,
        'https://*.githubusercontent.com',
    ],
    manifest: ['self'],
    media: [
        'self',
        'https://github.com',
        'https://raw.githubusercontent.com',
        GITHUB_USER_ATTACHMENT_RUNTIME_ORIGIN,
        'https://*.githubusercontent.com',
    ],
    style: ['self'],
};

const NON_EXECUTABLE_SCRIPT_TYPES = new Set(['application/ld+json']);

export function isExecutableScript({
    src,
    type,
}: {
    src: string | null;
    type: string | null;
}): boolean {
    if (src) {
        return true;
    }

    const normalizedType = type?.trim().toLowerCase() ?? '';

    if (!normalizedType) {
        return true;
    }

    return !NON_EXECUTABLE_SCRIPT_TYPES.has(normalizedType);
}

export function normalizeResourceOrigin(url: string): string {
    if (url.startsWith('data:')) {
        return 'data:';
    }

    if (isGithubUserAttachmentUrl(url)) {
        return GITHUB_USER_ATTACHMENT_RUNTIME_ORIGIN;
    }

    if (url.startsWith('//')) {
        return new URL(`https:${url}`).origin;
    }

    if (url.startsWith('/')) {
        return 'self';
    }

    try {
        const normalizedOrigin = new URL(url).origin;

        return normalizedOrigin === SITE_ORIGIN ? 'self' : normalizedOrigin;
    } catch {
        return 'self';
    }
}

function matchesAllowedOriginPattern(
    origin: string,
    allowedPattern: AllowedOriginPattern,
): boolean {
    if (allowedPattern === 'data:' || allowedPattern === 'self') {
        return origin === allowedPattern;
    }

    if (!allowedPattern.includes('*.')) {
        return origin === allowedPattern;
    }

    try {
        const originUrl = new URL(origin);
        const wildcardPatternUrl = new URL(allowedPattern.replace('*.', ''));

        return (
            originUrl.protocol === wildcardPatternUrl.protocol &&
            originUrl.hostname.endsWith(`.${wildcardPatternUrl.hostname}`)
        );
    } catch {
        return false;
    }
}

export function isAllowedResourceUrl(
    url: string,
    resourceKind: ResourceKind,
): boolean {
    if (url.trim().toLowerCase().startsWith('http:')) {
        return false;
    }

    const origin = normalizeResourceOrigin(url);

    return ALLOWED_ORIGIN_PATTERNS[resourceKind].some((pattern) =>
        matchesAllowedOriginPattern(origin, pattern),
    );
}

export function classifyLinkResource({
    as,
    rel,
}: {
    as: string | null;
    rel: string;
}): ResourceKind | 'disallowed' | 'ignore' {
    const relTokens = rel.toLowerCase().split(/\s+/).filter(Boolean);

    if (relTokens.includes('manifest')) {
        return 'manifest';
    }

    if (relTokens.includes('prefetch')) {
        return 'document';
    }

    if (relTokens.includes('modulepreload')) {
        return 'disallowed';
    }

    if (relTokens.includes('preload')) {
        switch ((as ?? '').toLowerCase()) {
            case 'document':
                return 'document';
            case 'image':
                return 'image';
            case 'style':
                return 'style';
            default:
                return 'disallowed';
        }
    }

    if (relTokens.includes('stylesheet')) {
        return 'style';
    }

    if (
        relTokens.includes('icon') ||
        relTokens.includes('apple-touch-icon') ||
        relTokens.includes('mask-icon')
    ) {
        return 'image';
    }

    return 'ignore';
}
