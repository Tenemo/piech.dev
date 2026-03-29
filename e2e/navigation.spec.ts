import { expect, test } from '@playwright/test';

import { gotoRoute } from './support/siteSupport';

test.describe('navigation chrome', () => {
    test('skip link targets the current route instead of the site root', async ({
        page,
    }) => {
        await gotoRoute(page, '/projects/');

        await expect(
            page.getByRole('link', { name: 'Skip to main content' }),
        ).toHaveAttribute('href', '/projects/#main-content');
    });

    test('projects is highlighted on the projects listing route', async ({
        page,
    }) => {
        await gotoRoute(page, '/projects/');
        const primaryNav = page.getByRole('navigation', { name: 'Primary' });

        await expect(
            primaryNav.getByRole('link', { exact: true, name: 'Projects' }),
        ).toHaveAttribute('aria-current', 'page');
        await expect(
            primaryNav.getByRole('link', { exact: true, name: 'About me' }),
        ).not.toHaveAttribute('aria-current', 'page');
        await expect(
            primaryNav.getByRole('link', { exact: true, name: 'Contact' }),
        ).not.toHaveAttribute('aria-current', 'page');
    });

    test('contact is highlighted on the contact route', async ({ page }) => {
        await gotoRoute(page, '/contact/');
        const primaryNav = page.getByRole('navigation', { name: 'Primary' });

        await expect(
            primaryNav.getByRole('link', { exact: true, name: 'Contact' }),
        ).toHaveAttribute('aria-current', 'page');
        await expect(
            primaryNav.getByRole('link', { exact: true, name: 'About me' }),
        ).not.toHaveAttribute('aria-current', 'page');
        await expect(
            primaryNav.getByRole('link', { exact: true, name: 'Projects' }),
        ).not.toHaveAttribute('aria-current', 'page');
    });
});
