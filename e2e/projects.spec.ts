import { test } from '@playwright/test';

import {
    PROJECT_ROUTE_CONTRACTS,
    PROJECT_ROUTES,
    PROJECTS_PAGE,
} from './support/siteContracts';
import { expectProjectPageLoaded, gotoRoute } from './support/siteSupport';

test.describe('projects routes', () => {
    test.describe.configure({ mode: 'parallel' });

    for (const projectRouteContract of PROJECT_ROUTE_CONTRACTS) {
        test(`project card "${projectRouteContract.name}" opens its detail page`, async ({
            page,
        }) => {
            await gotoRoute(page, PROJECTS_PAGE.route);

            await page
                .getByRole('link', {
                    name: `View ${projectRouteContract.name} project details`,
                })
                .click();

            await expectProjectPageLoaded(page, projectRouteContract.route);
        });
    }

    for (const route of PROJECT_ROUTES) {
        test(`${route} loads core project content`, async ({ page }) => {
            await gotoRoute(page, route);
            await expectProjectPageLoaded(page, route);
        });
    }
});
