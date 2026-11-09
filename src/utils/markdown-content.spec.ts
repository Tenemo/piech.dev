import { describe, expect, it } from 'vitest';

import {
    stripRedundantLeadingHeading,
    toRepositoryAssetUrl,
} from './markdown-content';

describe('repository asset URLs', () => {
    it.each([
        ['./image.png?size=2#crop', '2', '#crop'],
        ['./image.png#crop', null, '#crop'],
        ['./image.png?size=2&raw=false#crop', '2', '#crop'],
        ['./image.png?size=2&raw=false&raw=false', '2', ''],
    ])(
        'preserves query and fragment when serving %s as raw media',
        (input, size, fragment) => {
            const url = new URL(
                toRepositoryAssetUrl({
                    url: input,
                    repo: 'piech.dev',
                    defaultBranch: 'main',
                    key: 'src',
                }),
            );
            expect(url.pathname).toBe('/Tenemo/piech.dev/blob/main/image.png');
            expect(url.searchParams.get('size')).toBe(size);
            expect(url.searchParams.getAll('raw')).toEqual(['true']);
            expect(url.hash).toBe(fragment);
        },
    );

    it('preserves repository link queries without requesting raw content', () => {
        const url = new URL(
            toRepositoryAssetUrl({
                url: './guide.md?view=source#usage',
                repo: 'piech.dev',
                defaultBranch: 'main',
                key: 'href',
            }),
        );
        expect(url.searchParams.get('view')).toBe('source');
        expect(url.searchParams.has('raw')).toBe(false);
        expect(url.hash).toBe('#usage');
    });

    it.each([
        'https://example.com/image.png?size=2#crop',
        '//example.com/image.png',
        '#diagram',
    ])('leaves external or fragment-only media %s unchanged', (url) => {
        expect(
            toRepositoryAssetUrl({
                url,
                repo: 'piech.dev',
                defaultBranch: 'main',
                key: 'src',
            }),
        ).toBe(url);
    });
});

describe('README heading normalization', () => {
    it.each([
        [
            '\uFEFFOpening paragraph.\r\n\r\n## Usage',
            'Opening paragraph.\r\n\r\n## Usage',
        ],
        [
            '\uFEFF\r\n# Another title\r\n\r\nContent.',
            '\r\n# Another title\r\n\r\nContent.',
        ],
        ['\uFEFF\r\n# piech.dev\r\n\r\nContent.', 'Content.'],
        ['\uFEFF', ''],
        ['\uFEFF\n\n', '\n\n'],
        ['# Another title\n\nContent.', '# Another title\n\nContent.'],
    ])('normalizes BOM and leading title in %j', (markdown, expected) => {
        expect(
            stripRedundantLeadingHeading({
                markdown,
                comparisonCandidates: ['piech.dev'],
            }),
        ).toBe(expected);
    });
});
