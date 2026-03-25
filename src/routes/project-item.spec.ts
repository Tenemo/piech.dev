import { describe, expect, it } from 'vitest';

import { meta as projectItemMeta } from './project-item';

describe('project-item route meta', () => {
    it('uses a trailing-slash canonical URL for project routes', () => {
        const metaArgs = {
            params: { repo: 'sealed-vote-web' },
            data: null,
            location: {
                pathname: '/projects/sealed-vote-web/',
                search: '',
                hash: '',
                state: null,
                key: 'test',
                unstable_mask: undefined,
            },
            loaderData: {} as Record<string, never>,
            matches: [],
        } satisfies Parameters<typeof projectItemMeta>[0];

        const tags = projectItemMeta(metaArgs);

        expect(tags).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    tagName: 'link',
                    rel: 'canonical',
                    href: 'https://piech.dev/projects/sealed-vote-web/',
                }),
                expect.objectContaining({
                    property: 'og:url',
                    content: 'https://piech.dev/projects/sealed-vote-web/',
                }),
            ]),
        );
    });
});
