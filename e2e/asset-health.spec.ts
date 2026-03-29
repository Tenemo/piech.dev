import { expect, test, type ConsoleMessage } from '@playwright/test';

import { E2E_BASE_URL, SHOULD_USE_REMOTE_E2E } from './support/e2eConfig';
import {
    getInternalAssetPaths,
    getPublicRoutes,
    gotoRoute,
    runRouteChecks,
} from './support/siteSupport';

test.beforeEach(({ browserName: _browserName }, testInfo) => {
    test.skip(
        testInfo.project.name !== 'Desktop Chrome',
        'Asset and console checks are browser-invariant and run once in Desktop Chrome.',
    );
});

test('all public routes reference healthy internal assets', async ({
    page,
    request,
}) => {
    test.slow(
        SHOULD_USE_REMOTE_E2E,
        'Remote production asset checks traverse many routes and request every internal asset.',
    );

    const publicRoutes = await getPublicRoutes(page);

    await runRouteChecks({
        routes: publicRoutes,
        label: 'asset health route',
        check: async (route) => {
            await gotoRoute(page, route);

            const internalAssetPaths = await getInternalAssetPaths(page);

            for (const assetPath of internalAssetPaths) {
                const response = await request.get(
                    `${E2E_BASE_URL}${assetPath}`,
                );

                expect(
                    response.ok(),
                    `${route} asset ${assetPath} returned status ${String(response.status())}.`,
                ).toBe(true);
            }
        },
    });
});

test('all public routes emit no console or page errors', async ({ page }) => {
    const publicRoutes = await getPublicRoutes(page);
    await runRouteChecks({
        routes: publicRoutes,
        label: 'runtime health route',
        check: async (route) => {
            const routePage = await page.context().newPage();
            const consoleErrors: string[] = [];
            const pageErrors: string[] = [];
            const consoleListener = (message: ConsoleMessage): void => {
                if (message.type() === 'error') {
                    consoleErrors.push(message.text());
                }
            };
            const pageErrorListener = (error: Error): void => {
                pageErrors.push(error.message);
            };

            routePage.on('console', consoleListener);
            routePage.on('pageerror', pageErrorListener);

            try {
                await gotoRoute(routePage, route);
                await routePage.waitForTimeout(250);

                expect(
                    consoleErrors,
                    `${route} emitted console errors.`,
                ).toEqual([]);
                expect(pageErrors, `${route} emitted page errors.`).toEqual([]);
            } finally {
                routePage.off('console', consoleListener);
                routePage.off('pageerror', pageErrorListener);
                await routePage.close();
            }
        },
    });
});
