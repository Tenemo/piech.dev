import { describe, expect, it } from 'vitest';

import { meta as indexMeta } from './index';

describe('index route meta', () => {
    it('uses a trailing-slash canonical URL for the home route', () => {
        const metaArgs = {
            params: {},
            data: null,
            location: {
                pathname: '/',
                search: '',
                hash: '',
                state: null,
                key: 'test',
                unstable_mask: undefined,
            },
            loaderData: {} as Record<string, never>,
            matches: [],
        } satisfies Parameters<typeof indexMeta>[0];

        const tags = indexMeta(metaArgs);

        expect(tags).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    tagName: 'link',
                    rel: 'canonical',
                    href: 'https://piech.dev/',
                }),
                expect.objectContaining({
                    property: 'og:url',
                    content: 'https://piech.dev/',
                }),
            ]),
        );
    });
});
