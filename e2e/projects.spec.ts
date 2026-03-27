import { test } from '@playwright/test';

import { FLAGSHIP_PROJECTS, PROJECTS_PAGE } from './support/siteContracts';
import {
    expectProjectPageLoaded,
    getLinkedProjectRoutes,
    runRouteChecks,
} from './support/siteSupport';

test('flagship project cards open the intended detail pages', async ({
    page,
}) => {
    await page.goto(PROJECTS_PAGE.route);

    for (const flagshipProject of FLAGSHIP_PROJECTS) {
        await test.step(flagshipProject.cardName, async () => {
            await page
                .getByRole('link', {
                    name: `View ${flagshipProject.cardName} project details`,
                })
                .click();

            await expectProjectPageLoaded(page, flagshipProject.route);

            await page.goto(PROJECTS_PAGE.route);
        });
    }
});

test('all project detail routes load core content', async ({ page }) => {
    const projectRoutes = await getLinkedProjectRoutes(page);

    await runRouteChecks({
        routes: projectRoutes,
        label: 'project route',
        check: async (route) => {
            await page.goto(route, { waitUntil: 'load' });
            await expectProjectPageLoaded(page, route);
        },
    });
});
