import { expect, test, type ConsoleMessage } from '@playwright/test';

import { E2E_BASE_URL } from './support/e2eConfig';
import {
    getInternalAssetPaths,
    getPublicRoutes,
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
    const publicRoutes = await getPublicRoutes(page);

    await runRouteChecks({
        routes: publicRoutes,
        label: 'asset health route',
        check: async (route) => {
            await page.goto(route, { waitUntil: 'load' });

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

    page.on('console', consoleListener);
    page.on('pageerror', pageErrorListener);

    try {
        await runRouteChecks({
            routes: publicRoutes,
            label: 'runtime health route',
            check: async (route) => {
                consoleErrors.length = 0;
                pageErrors.length = 0;

                await page.goto(route, { waitUntil: 'load' });

                expect(
                    consoleErrors,
                    `${route} emitted console errors.`,
                ).toEqual([]);
                expect(pageErrors, `${route} emitted page errors.`).toEqual([]);
            },
        });
    } finally {
        page.off('console', consoleListener);
        page.off('pageerror', pageErrorListener);
    }
});
