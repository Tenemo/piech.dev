import { describe, expect, it } from 'vitest';

import { meta as contactMeta } from './contact';

describe('contact route meta', () => {
    it('uses a trailing-slash canonical URL for the contact route', () => {
        const metaArgs = {
            params: {},
            data: null,
            location: {
                pathname: '/contact/',
                search: '',
                hash: '',
                state: null,
                key: 'test',
                unstable_mask: undefined,
            },
            loaderData: {} as Record<string, never>,
            matches: [],
        } satisfies Parameters<typeof contactMeta>[0];

        const tags = contactMeta(metaArgs);

        expect(tags).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    tagName: 'link',
                    rel: 'canonical',
                    href: 'https://piech.dev/contact/',
                }),
                expect.objectContaining({
                    property: 'og:url',
                    content: 'https://piech.dev/contact/',
                }),
            ]),
        );
    });
});
