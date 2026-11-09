import { expect, test } from '@playwright/test';

import { PROJECTS } from '../src/features/Projects/projectsData';

import { PUBLIC_ROUTES } from './support/siteContracts';

test('LLM guide links to every project Markdown export', async ({
    request,
}) => {
    const response = await request.get('/llms.txt', { maxRedirects: 0 });
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toMatch(/^text\/plain\b/u);
    const guide = await response.text();
    expect(guide).toMatch(/^# piech\.dev\n/u);
    const links = [
        ...guide.matchAll(
            /\]\((https:\/\/piech\.dev\/projects\/[^)]+\/index\.md)\)/gu,
        ),
    ].map((match) => new URL(match[1]).pathname);
    expect(links).toEqual(
        PROJECTS.map((project) => `/projects/${project.repo}/index.md`),
    );
    for (const pathname of links) {
        const document = await request.get(pathname, { maxRedirects: 0 });
        expect(document.status(), pathname).toBe(200);
        expect(document.headers()['content-type'], pathname).toMatch(
            /^text\/markdown\b/u,
        );
        const markdown = await document.text();
        expect(markdown, pathname).toMatch(/^# .+\n/u);
        expect(markdown, pathname).toContain(
            `[Project page](https://piech.dev${pathname.replace(/index\.md$/u, '')})`,
        );
        expect(markdown, pathname).toContain('Technologies:');
    }
});

test('HTML pages advertise the guide and available Markdown alternatives', async ({
    page,
}) => {
    for (const route of PUBLIC_ROUTES) {
        await page.goto(route);
        await expect(
            page.locator('head link[rel="describedby"]'),
        ).toHaveAttribute('href', '/llms.txt');
        const alternate = page.locator(
            'head link[rel="alternate"][type="text/markdown"]',
        );
        if (
            PROJECTS.some((project) => route === `/projects/${project.repo}/`)
        ) {
            await expect(alternate).toHaveAttribute('href', `${route}index.md`);
        } else {
            await expect(alternate).toHaveCount(0);
        }
    }
});
