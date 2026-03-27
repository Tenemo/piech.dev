import { expect, test } from '@playwright/test';

import {
    FOOTER_REPOSITORY_URL,
    HOME_CTA_CONTRACTS,
    HOME_PAGE,
    TOP_LEVEL_PAGES,
} from './support/siteContracts';
import { expectTopLevelPageLoaded } from './support/siteSupport';

test('header navigation reaches each top-level section', async ({ page }) => {
    await page.goto(HOME_PAGE.route);

    const navigation = page.getByRole('navigation', { name: 'Primary' });

    for (const destination of TOP_LEVEL_PAGES) {
        await test.step(destination.navigationLinkName, async () => {
            await navigation
                .getByRole('link', { name: destination.navigationLinkName })
                .click();

            await expectTopLevelPageLoaded(page, destination);
        });
    }
});

test('home call-to-action links reach the intended sections', async ({
    page,
}) => {
    await page.goto(HOME_PAGE.route);

    for (const cta of HOME_CTA_CONTRACTS) {
        await test.step(cta.linkName, async () => {
            await page.getByRole('link', { name: cta.linkName }).click();

            await expectTopLevelPageLoaded(page, cta.destination);

            await page.goto(HOME_PAGE.route);
        });
    }
});

test('footer repository link remains available on top-level pages', async ({
    page,
}) => {
    for (const topLevelPage of TOP_LEVEL_PAGES) {
        await test.step(topLevelPage.route, async () => {
            await page.goto(topLevelPage.route);

            const repositoryLink = page.getByRole('link', {
                name: 'GitHub repository',
            });

            await expect(repositoryLink).toHaveAttribute(
                'href',
                FOOTER_REPOSITORY_URL,
            );
            await expect(repositoryLink).toHaveAttribute('target', '_blank');
            await expect(repositoryLink).toHaveAttribute(
                'rel',
                'noopener noreferrer',
            );
        });
    }
});
