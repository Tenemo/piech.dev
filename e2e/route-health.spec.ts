import { expect, test } from '@playwright/test';

import { PUBLIC_ROUTES } from './support/siteContracts';
import { gotoRoute } from './support/siteSupport';

test.describe('route health', () => {
    test.describe.configure({ mode: 'parallel' });

    for (const route of PUBLIC_ROUTES) {
        test(`${route} loads successfully with the global landmarks`, async ({
            page,
        }) => {
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
        });
    }
});
