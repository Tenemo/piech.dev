import {
    expect,
    test,
    type APIRequestContext,
    type Page,
} from '@playwright/test';

import { E2E_BASE_URL, SHOULD_USE_REMOTE_E2E } from './e2eConfig';
import {
    GITHUB_PROFILE_URL,
    PRODUCTION_SITE_ORIGIN,
    PROJECTS_PAGE,
    TOP_LEVEL_PAGES,
    type TopLevelPageContract,
} from './siteContracts';

const SITEMAP_LOCATION_PATTERN = /<loc>([^<]+)<\/loc>/g;
const JAVASCRIPT_MIME_TYPES = new Set([
    '',
    'application/javascript',
    'module',
    'text/javascript',
]);
const NETLIFY_CHALLENGE_BODY_TEXT = 'We are verifying your connection';
const NETLIFY_CHALLENGE_BRAND_TEXT = 'Security by Netlify';
const REMOTE_NAVIGATION_RETRY_DELAY_MS = 1_000;
const REMOTE_NAVIGATION_RETRY_COUNT = 3;
const NETLIFY_CHALLENGE_WAIT_TIMEOUT_MS = 15_000;
const PRERENDERED_ROUTE_WAIT_UNTIL = 'domcontentloaded';

let cachedSitemapRoutesPromise: Promise<string[]> | undefined;

const normalizeRoute = (route: string): string => {
    if (route === '/') {
        return route;
    }

    return route.endsWith('/') ? route : `${route}/`;
};

const uniqueSort = (values: readonly string[]): string[] =>
    Array.from(new Set(values)).sort();

const formatError = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message;
    }

    return String(error);
};

const isNetlifyChallengePage = async (page: Page): Promise<boolean> => {
    const bodyText = await page
        .locator('body')
        .innerText()
        .catch(() => '');

    return (
        bodyText.includes(NETLIFY_CHALLENGE_BODY_TEXT) &&
        bodyText.includes(NETLIFY_CHALLENGE_BRAND_TEXT)
    );
};

export const getProjectSlugFromRoute = (route: string): string => {
    const segments = normalizeRoute(route).split('/').filter(Boolean);
    const projectSlug = segments[1];

    if (!projectSlug) {
        throw new Error(
            `Could not determine project slug from route "${route}".`,
        );
    }

    return projectSlug;
};

export const gotoRoute = async (
    page: Page,
    route: string,
): Promise<Awaited<ReturnType<Page['goto']>>> => {
    // The site is fully prerendered and ships without client JS, so DOMContentLoaded
    // gives us stable markup without waiting for heavy media downloads on production.
    const maxAttempts = SHOULD_USE_REMOTE_E2E
        ? REMOTE_NAVIGATION_RETRY_COUNT
        : 1;
    let response: Awaited<ReturnType<Page['goto']>> | undefined;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        response = await page.goto(route, {
            waitUntil: PRERENDERED_ROUTE_WAIT_UNTIL,
        });

        if (await isNetlifyChallengePage(page)) {
            try {
                await page.waitForFunction(
                    ({ challengeText, brandText }) => {
                        const bodyText = document.body.innerText;

                        return !(
                            bodyText.includes(challengeText) &&
                            bodyText.includes(brandText)
                        );
                    },
                    {
                        brandText: NETLIFY_CHALLENGE_BRAND_TEXT,
                        challengeText: NETLIFY_CHALLENGE_BODY_TEXT,
                    },
                    {
                        timeout: NETLIFY_CHALLENGE_WAIT_TIMEOUT_MS,
                    },
                );
            } catch {
                // Fall back to a bounded retry if the temporary challenge page persists.
            }
        }

        const challengeStillVisible = await isNetlifyChallengePage(page);
        const responseOk = response?.ok() ?? false;

        if (!challengeStillVisible && responseOk) {
            return response;
        }

        if (attempt < maxAttempts - 1) {
            await page.waitForTimeout(REMOTE_NAVIGATION_RETRY_DELAY_MS);
        }
    }

    return response ?? null;
};

export const getLinkedProjectRoutes = async (page: Page): Promise<string[]> => {
    await gotoRoute(page, PROJECTS_PAGE.route);

    return page.getByRole('link').evaluateAll((links, projectsRoute) => {
        const normalize = (pathname: string): string =>
            pathname === '/' || pathname.endsWith('/')
                ? pathname
                : `${pathname}/`;

        return Array.from(
            new Set(
                links
                    .map((link) => link.getAttribute('href'))
                    .filter((href): href is string => href !== null)
                    .map((href) => new URL(href, window.location.origin))
                    .filter(
                        (url) =>
                            url.origin === window.location.origin &&
                            url.pathname.startsWith(projectsRoute) &&
                            url.pathname !== projectsRoute,
                    )
                    .map((url) => normalize(url.pathname)),
            ),
        ).sort();
    }, PROJECTS_PAGE.route);
};

export const getPublicRoutes = async (page: Page): Promise<string[]> => {
    const linkedProjectRoutes = await getLinkedProjectRoutes(page);

    return uniqueSort([
        ...TOP_LEVEL_PAGES.map(({ route }) => route),
        ...linkedProjectRoutes,
    ]);
};

export const getSitemapRoutes = async (
    request: APIRequestContext,
): Promise<string[]> => {
    cachedSitemapRoutesPromise ??= (async () => {
        const response = await request.get(`${E2E_BASE_URL}/sitemap.xml`);

        if (!response.ok()) {
            throw new Error(
                `Failed to load sitemap.xml: received status ${String(response.status())}.`,
            );
        }

        const xml = await response.text();

        return uniqueSort(
            Array.from(xml.matchAll(SITEMAP_LOCATION_PATTERN), (match) =>
                normalizeRoute(new URL(match[1]).pathname),
            ),
        );
    })();

    return cachedSitemapRoutesPromise;
};

export const getSameOriginScriptSrcPaths = async (
    page: Page,
): Promise<string[]> => {
    return page.locator('script[src]').evaluateAll(
        (scripts, { localOrigin, productionOrigin }) =>
            Array.from(
                new Set(
                    scripts
                        .map((script) => script.getAttribute('src'))
                        .filter((src): src is string => src !== null)
                        .map((src) => new URL(src, localOrigin))
                        .filter(
                            (url) =>
                                url.origin === localOrigin ||
                                url.origin === productionOrigin,
                        )
                        .map((url) => `${url.pathname}${url.search}`),
                ),
            ).sort(),
        {
            localOrigin: E2E_BASE_URL,
            productionOrigin: PRODUCTION_SITE_ORIGIN,
        },
    );
};

export const getUnexpectedInlineScriptSummaries = async (
    page: Page,
): Promise<string[]> => {
    return page.locator('script:not([src])').evaluateAll(
        (scripts, javascriptMimeTypes) =>
            scripts
                .map((script) => {
                    const type = (script.getAttribute('type') ?? '')
                        .trim()
                        .toLowerCase();
                    const contents = script.textContent.trim();

                    return {
                        type,
                        contents,
                    };
                })
                .filter(
                    ({ type, contents }) =>
                        contents.length > 0 &&
                        type !== 'application/ld+json' &&
                        javascriptMimeTypes.includes(type),
                )
                .map(
                    ({ type, contents }) =>
                        `type="${type || '(default)'}": ${contents.slice(0, 120)}`,
                ),
        Array.from(JAVASCRIPT_MIME_TYPES),
    );
};

export const getInternalAssetPaths = async (page: Page): Promise<string[]> => {
    return page.evaluate(
        ({ localOrigin, productionOrigin }) => {
            const assets = new Set<string>();
            const selectors: readonly (readonly [string, string])[] = [
                ['img[src]', 'src'],
                ['source[src]', 'src'],
                ['video[src]', 'src'],
                ['track[src]', 'src'],
                ['link[rel="icon"][href]', 'href'],
                ['link[rel="shortcut icon"][href]', 'href'],
                ['link[rel="apple-touch-icon"][href]', 'href'],
                ['link[rel="manifest"][href]', 'href'],
                ['meta[property="og:image"][content]', 'content'],
            ];

            const addAssetPath = (rawUrl: string | null): void => {
                if (!rawUrl) {
                    return;
                }

                try {
                    const resolvedUrl = new URL(rawUrl, localOrigin);

                    if (
                        resolvedUrl.origin !== localOrigin &&
                        resolvedUrl.origin !== productionOrigin
                    ) {
                        return;
                    }

                    assets.add(`${resolvedUrl.pathname}${resolvedUrl.search}`);
                } catch {
                    // Ignore malformed URLs and let route-level assertions fail elsewhere if needed.
                }
            };

            for (const [selector, attributeName] of selectors) {
                for (const element of document.querySelectorAll(selector)) {
                    addAssetPath(element.getAttribute(attributeName));
                }
            }

            return Array.from(assets).sort();
        },
        {
            localOrigin: E2E_BASE_URL,
            productionOrigin: PRODUCTION_SITE_ORIGIN,
        },
    );
};

export const getJsonLdPayloads = async (page: Page): Promise<string[]> => {
    return page
        .locator('script[type="application/ld+json"]')
        .evaluateAll((scripts) =>
            scripts
                .map((script) => script.textContent.trim())
                .filter((contents) => contents.length > 0),
        );
};

export const expectTopLevelPageLoaded = async (
    page: Page,
    contract: TopLevelPageContract,
): Promise<void> => {
    await expect(page).toHaveURL(
        new URL(contract.route, E2E_BASE_URL).toString(),
    );
    await expect(page).toHaveTitle(contract.title);
    await expect(
        page.getByRole('heading', { level: 2, name: contract.heading }),
    ).toBeVisible();
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('contentinfo')).toBeVisible();
};

export const expectProjectPageLoaded = async (
    page: Page,
    route: string,
): Promise<void> => {
    const projectSlug = getProjectSlugFromRoute(route);
    const main = page.getByRole('main');

    await expect(page).toHaveURL(new URL(route, E2E_BASE_URL).toString());
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(main).toBeVisible();
    await expect(page.getByRole('contentinfo')).toBeVisible();

    const mainHeading = main.getByRole('heading', { level: 1 }).first();

    await expect(mainHeading).toBeVisible();

    const projectTitle = (await mainHeading.textContent())?.trim() ?? '';

    expect(
        projectTitle,
        `${route} should expose a non-empty main heading.`,
    ).not.toBe('');
    await expect(page).toHaveTitle(/.+ \| piech\.dev$/);
    await expect(
        page.getByRole('link', { name: 'Back to Projects' }),
    ).toHaveAttribute('href', PROJECTS_PAGE.route);

    const githubLink = page.getByRole('link', {
        name: `github.com/tenemo/${projectSlug}`,
    });

    await expect(githubLink).toBeVisible();
    await expect(githubLink).toHaveAttribute(
        'href',
        `${GITHUB_PROFILE_URL}/${projectSlug}`,
    );
    await expect(githubLink).toHaveAttribute('target', '_blank');
    await expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');

    await expect(
        main.locator('p, ul, ol, pre, img, video').first(),
    ).toBeVisible();
};

export const runRouteChecks = async ({
    routes,
    label,
    check,
}: {
    routes: readonly string[];
    label: string;
    check: (route: string) => Promise<void>;
}): Promise<void> => {
    const failures: string[] = [];

    for (const route of routes) {
        try {
            await test.step(`${label}: ${route}`, async () => {
                await check(route);
            });
        } catch (error) {
            failures.push(`${route}\n${formatError(error)}`);
        }
    }

    expect(
        failures,
        failures.length === 0
            ? 'All route checks passed.'
            : failures.join('\n\n'),
    ).toEqual([]);
};
