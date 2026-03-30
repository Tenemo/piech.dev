import { describe, expect, it } from 'vitest';

import {
    classifyLinkResource,
    isAllowedResourceUrl,
    isExecutableScript,
    normalizeResourceOrigin,
} from './cspCompatibility';

describe('cspCompatibility', () => {
    it('treats only JSON-LD script blocks as non-executable', () => {
        expect(
            isExecutableScript({
                src: null,
                type: 'application/ld+json',
            }),
        ).toBe(false);
        expect(isExecutableScript({ src: null, type: null })).toBe(true);
        expect(
            isExecutableScript({
                src: '/assets/app.js',
                type: 'application/ld+json',
            }),
        ).toBe(true);
    });

    it('allows the current image and media origins', () => {
        expect(
            isAllowedResourceUrl(
                '/.netlify/images?url=%2Fmedia%2Fprojects%2Fpiech.dev.webp&w=600',
                'image',
            ),
        ).toBe(true);
        expect(
            isAllowedResourceUrl(
                'https://api.netlify.com/api/v1/badges/example/deploy-status',
                'image',
            ),
        ).toBe(true);
        expect(
            isAllowedResourceUrl(
                'https://d25lcipzij17d.cloudfront.net/badge.svg?c=example',
                'image',
            ),
        ).toBe(true);
        expect(
            isAllowedResourceUrl(
                'https://private-user-images.githubusercontent.com/example',
                'image',
            ),
        ).toBe(true);
        expect(
            isAllowedResourceUrl(
                'https://github.com/user-attachments/assets/12345678-1234-5678-9abc-123456789abc',
                'media',
            ),
        ).toBe(true);
        expect(
            isAllowedResourceUrl(
                '//github.com/user-attachments/assets/12345678-1234-5678-9abc-123456789abc',
                'media',
            ),
        ).toBe(true);
        expect(
            isAllowedResourceUrl(
                'https://github-production-user-asset-6210df.s3.amazonaws.com/example.mp4',
                'media',
            ),
        ).toBe(true);
        expect(
            isAllowedResourceUrl(
                'https://raw.githubusercontent.com/tenemo/test-repo/main/demo.mp4',
                'media',
            ),
        ).toBe(true);
        expect(
            isAllowedResourceUrl(
                'https://piech.dev/favicon/site.webmanifest',
                'manifest',
            ),
        ).toBe(true);
    });

    it('rejects insecure or off-policy resource URLs', () => {
        expect(
            isAllowedResourceUrl('http://example.com/insecure.png', 'image'),
        ).toBe(false);
        expect(
            isAllowedResourceUrl('https://example.com/image.png', 'image'),
        ).toBe(false);
        expect(
            isAllowedResourceUrl('https://example.com/video.mp4', 'media'),
        ).toBe(false);
    });

    it('normalizes protocol-relative URLs to their actual origin', () => {
        expect(normalizeResourceOrigin('//cdn.example.com/image.png')).toBe(
            'https://cdn.example.com',
        );
        expect(
            normalizeResourceOrigin(
                '//private-user-images.githubusercontent.com/example',
            ),
        ).toBe('https://private-user-images.githubusercontent.com');
        expect(
            normalizeResourceOrigin(
                '//github.com/user-attachments/assets/12345678-1234-5678-9abc-123456789abc',
            ),
        ).toBe('https://github-production-user-asset-6210df.s3.amazonaws.com');
    });

    it('classifies fetchable links for CSP validation', () => {
        expect(classifyLinkResource({ as: 'image', rel: 'preload' })).toBe(
            'image',
        );
        expect(classifyLinkResource({ as: 'document', rel: 'prefetch' })).toBe(
            'document',
        );
        expect(classifyLinkResource({ as: null, rel: 'manifest' })).toBe(
            'manifest',
        );
        expect(classifyLinkResource({ as: 'script', rel: 'preload' })).toBe(
            'disallowed',
        );
    });
});
