import { expect, test, type Request } from '@playwright/test';

import { E2E_BASE_URL } from './support/e2eConfig';
import { PRODUCTION_SITE_ORIGIN, PUBLIC_ROUTES } from './support/siteContracts';
import {
    getSameOriginScriptSrcPaths,
    gotoRoute,
    getUnexpectedInlineScriptSummaries,
} from './support/siteSupport';

test.describe('zero-js contract', () => {
    test.describe.configure({ mode: 'parallel' });

    test.beforeEach(({ browserName: _browserName }, testInfo) => {
        test.skip(
            testInfo.project.name !== 'Desktop Chrome',
            'Zero-JS checks are browser-invariant and run once in Desktop Chrome.',
        );
    });

    for (const route of PUBLIC_ROUTES) {
        test(`${route} ships without executable JavaScript`, async ({
            page,
        }) => {
            const sameOriginScriptRequests: string[] = [];
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
        });
    }
});
