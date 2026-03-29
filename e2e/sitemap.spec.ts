import { expect, test } from '@playwright/test';

import { PUBLIC_ROUTES } from './support/siteContracts';
import { getSitemapRoutes } from './support/siteSupport';

test('sitemap matches the public routes linked from the site', async ({
    request,
}) => {
    const sitemapRoutes = await getSitemapRoutes(request);

    expect(sitemapRoutes).toEqual(PUBLIC_ROUTES);
});
