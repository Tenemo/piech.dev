import { expect, test } from '@playwright/test';

import {
    getPublicRoutes,
    gotoRoute,
    runRouteChecks,
} from './support/siteSupport';

test.beforeEach(({ browserName: _browserName }, testInfo) => {
    test.skip(
        testInfo.project.name !== 'Desktop Chrome',
        'Route-health checks are browser-invariant and run once in Desktop Chrome.',
    );
});

test('every public route loads successfully with the global landmarks', async ({
    page,
}) => {
    const publicRoutes = await getPublicRoutes(page);

    await runRouteChecks({
        routes: publicRoutes,
        label: 'public route',
        check: async (route) => {
            const response = await gotoRoute(page, route);

            expect(
                response,
                `${route} should produce a document response.`,
            ).not.toBeNull();
            expect(
                response?.ok(),
                `${route} returned status ${String(response?.status())}.`,
            ).toBe(true);

            await expect(page.getByRole('banner')).toBeVisible();
            await expect(page.getByRole('main')).toBeVisible();
            await expect(page.getByRole('contentinfo')).toBeVisible();
        },
    });
});
