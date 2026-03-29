import { expect, test } from '@playwright/test';

import {
    FLAGSHIP_PROJECTS,
    TOP_LEVEL_PAGES,
    toProductionUrl,
} from './support/siteContracts';
import { getJsonLdPayloads, gotoRoute } from './support/siteSupport';

const PRODUCTION_OG_IMAGE_PATTERN =
    /^https:\/\/piech\.dev\/media\/projects\/og_images\/.+$/;

test.describe('seo metadata', () => {
    test.describe.configure({ mode: 'parallel' });

    for (const topLevelPage of TOP_LEVEL_PAGES) {
        test(`${topLevelPage.route} exposes the expected top-level SEO contract`, async ({
            page,
        }) => {
            await gotoRoute(page, topLevelPage.route);

            await expect(page).toHaveTitle(topLevelPage.title);
            await expect(
                page.locator('meta[name="description"]'),
            ).toHaveAttribute('content', topLevelPage.description);
            await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
                'content',
                'index, follow',
            );
            await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
                'href',
                toProductionUrl(topLevelPage.route),
            );
            await expect(
                page.locator('meta[property="og:url"]'),
            ).toHaveAttribute('content', toProductionUrl(topLevelPage.route));
            await expect(
                page.locator('meta[property="og:title"]'),
            ).toHaveAttribute('content', topLevelPage.title);

            const jsonLdPayloads = await getJsonLdPayloads(page);

            expect(
                jsonLdPayloads.length,
                `${topLevelPage.route} should include JSON-LD metadata.`,
            ).toBeGreaterThan(0);

            for (const jsonLdPayload of jsonLdPayloads) {
                expect(() => {
                    JSON.parse(jsonLdPayload);
                }).not.toThrow();
            }
        });
    }

    for (const flagshipProject of FLAGSHIP_PROJECTS) {
        test(`${flagshipProject.route} exposes canonical project SEO metadata`, async ({
            page,
        }) => {
            await gotoRoute(page, flagshipProject.route);

            await expect(
                page.getByRole('main').getByRole('heading', {
                    level: 1,
                    name: flagshipProject.cardName,
                }),
            ).toBeVisible();

            await expect(page).toHaveTitle(flagshipProject.pageTitle);
            await expect(
                page.locator('meta[name="description"]'),
            ).toHaveAttribute('content', /.+/);
            await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
                'href',
                toProductionUrl(flagshipProject.route),
            );
            await expect(
                page.locator('meta[property="og:url"]'),
            ).toHaveAttribute(
                'content',
                toProductionUrl(flagshipProject.route),
            );
            await expect(
                page.locator('meta[property="og:title"]'),
            ).toHaveAttribute('content', flagshipProject.pageTitle);
            await expect(
                page.locator('meta[property="og:image"]'),
            ).toHaveAttribute('content', PRODUCTION_OG_IMAGE_PATTERN);

            const jsonLdPayloads = await getJsonLdPayloads(page);

            expect(
                jsonLdPayloads.length,
                `${flagshipProject.route} should include JSON-LD metadata.`,
            ).toBeGreaterThan(0);

            for (const jsonLdPayload of jsonLdPayloads) {
                expect(() => {
                    JSON.parse(jsonLdPayload);
                }).not.toThrow();
            }
        });
    }
});
