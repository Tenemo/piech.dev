import { expect, test, type Request } from '@playwright/test';

import { E2E_BASE_URL } from './support/e2eConfig';
import { PRODUCTION_SITE_ORIGIN } from './support/siteContracts';
import {
    getPublicRoutes,
    getSameOriginScriptSrcPaths,
    gotoRoute,
    getUnexpectedInlineScriptSummaries,
    runRouteChecks,
} from './support/siteSupport';

test.beforeEach(({ browserName: _browserName }, testInfo) => {
    test.skip(
        testInfo.project.name !== 'Desktop Chrome',
        'Zero-JS checks are browser-invariant and run once in Desktop Chrome.',
    );
});

test('all public routes ship without executable JavaScript', async ({
    page,
}) => {
    const publicRoutes = await getPublicRoutes(page);
    const sameOriginScriptRequests: string[] = [];
    await runRouteChecks({
        routes: publicRoutes,
        label: 'zero-js route',
        check: async (route) => {
            sameOriginScriptRequests.length = 0;

            const routeRequestListener = (request: Request): void => {
                const requestUrl = new URL(request.url());

                if (
                    request.resourceType() === 'script' &&
                    (requestUrl.origin === E2E_BASE_URL ||
                        requestUrl.origin === PRODUCTION_SITE_ORIGIN)
                ) {
                    sameOriginScriptRequests.push(
                        `${requestUrl.pathname}${requestUrl.search}`,
                    );
                }
            };

            page.on('request', routeRequestListener);

            try {
                await gotoRoute(page, route);

                const unexpectedScriptSources =
                    await getSameOriginScriptSrcPaths(page);
                const unexpectedInlineScripts =
                    await getUnexpectedInlineScriptSummaries(page);

                expect(
                    sameOriginScriptRequests,
                    `${route} requested executable scripts.`,
                ).toEqual([]);
                expect(
                    unexpectedScriptSources,
                    `${route} includes unexpected script tags with src.`,
                ).toEqual([]);
                expect(
                    unexpectedInlineScripts,
                    `${route} includes unexpected inline scripts.`,
                ).toEqual([]);
            } finally {
                page.off('request', routeRequestListener);
            }
        },
    });
});
