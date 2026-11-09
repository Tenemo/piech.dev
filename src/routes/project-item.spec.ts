import { describe, expect, it } from 'vitest';

import { meta as projectItemMeta } from './project-item';

describe('project-item route meta', () => {
    it('uses a trailing-slash canonical URL for project routes', () => {
        const metaArgs = {
            params: { repo: 'tiles-town' },
            data: null,
            location: {
                pathname: '/projects/tiles-town/',
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
                { title: 'tiles.town | piech.dev' },
                expect.objectContaining({
                    tagName: 'link',
                    rel: 'canonical',
                    href: 'https://piech.dev/projects/tiles-town/',
                }),
                expect.objectContaining({
                    property: 'og:url',
                    content: 'https://piech.dev/projects/tiles-town/',
                }),
            ]),
        );
    });
});
