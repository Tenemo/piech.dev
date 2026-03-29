import { expect, test, type ConsoleMessage } from '@playwright/test';

import { E2E_BASE_URL, SHOULD_USE_REMOTE_E2E } from './support/e2eConfig';
import { PUBLIC_ROUTES } from './support/siteContracts';
import { getInternalAssetPaths, gotoRoute } from './support/siteSupport';

test.describe('asset health', () => {
    test.describe.configure({ mode: 'parallel' });

    for (const route of PUBLIC_ROUTES) {
        test(`${route} references healthy internal assets`, async ({
            page,
            request,
        }) => {
            test.slow(
                SHOULD_USE_REMOTE_E2E,
                'Remote production asset checks traverse many routes and request every internal asset.',
            );

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
        });

        test(`${route} emits no console or page errors`, async ({ page }) => {
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
                await gotoRoute(page, route);
                await page.waitForTimeout(250);

                expect(
                    consoleErrors,
                    `${route} emitted console errors.`,
                ).toEqual([]);
                expect(pageErrors, `${route} emitted page errors.`).toEqual([]);
            } finally {
                page.off('console', consoleListener);
                page.off('pageerror', pageErrorListener);
            }
        });
    }
});
