import { expect, test } from '@playwright/test';

import { gotoRoute } from './support/siteSupport';

test('keyboard users reach the skip link before the primary navigation', async ({
    page,
}) => {
    await gotoRoute(page, '/');

    await page.keyboard.press('Tab');

    await expect(
        page.getByRole('link', { name: 'Skip to main content' }),
    ).toBeFocused();
});
