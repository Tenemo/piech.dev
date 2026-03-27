import { expect, test } from '@playwright/test';

import { TOP_LEVEL_PAGES } from './support/siteContracts';
import {
    getLinkedProjectRoutes,
    getSitemapRoutes,
} from './support/siteSupport';

test.beforeEach(({ browserName: _browserName }, testInfo) => {
    test.skip(
        testInfo.project.name !== 'Desktop Chrome',
        'Sitemap checks are browser-invariant and run once in Desktop Chrome.',
    );
});

test('sitemap matches the public routes linked from the site', async ({
    page,
    request,
}) => {
    const linkedProjectRoutes = await getLinkedProjectRoutes(page);
    const expectedRoutes = [
        ...TOP_LEVEL_PAGES.map(({ route }) => route),
        ...linkedProjectRoutes,
    ].sort();
    const sitemapRoutes = await getSitemapRoutes(request);

    expect(sitemapRoutes).toEqual(expectedRoutes);
});
