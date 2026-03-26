import { expect, test } from '@playwright/test';

import { SITE_LINKS } from '../src/app/siteLinks';
import { PROJECTS } from '../src/features/Projects/projectsData';
import { E2E_BASE_URL } from '../src/utils/testing/e2eConfig';

const REPRESENTATIVE_ROUTES = [
    '/',
    '/projects/',
    '/projects/piech.dev/',
    '/contact/',
] as const;

test('home page renders and main navigation works', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle('piech.dev');
    await expect(
        page.getByRole('heading', { level: 2, name: 'About me' }),
    ).toBeVisible();

    await page
        .getByRole('navigation')
        .getByRole('link', { name: 'Projects' })
        .click();
    await expect(page).toHaveURL(/\/projects\/$/);
    await expect(
        page.getByRole('heading', { level: 2, name: 'Projects' }),
    ).toBeVisible();

    await page
        .getByRole('navigation')
        .getByRole('link', { name: 'Contact' })
        .click();
    await expect(page).toHaveURL(/\/contact\/$/);
    await expect(
        page.getByRole('heading', { level: 2, name: 'Contact' }),
    ).toBeVisible();

    await page
        .getByRole('navigation')
        .getByRole('link', { name: 'About me' })
        .click();
    await expect(page).toHaveURL(/\/$/);
    await expect(
        page.getByRole('heading', { level: 2, name: 'About me' }),
    ).toBeVisible();
});

test('home call-to-action links reach projects and contact', async ({
    page,
}) => {
    await page.goto('/');

    await page.getByRole('link', { name: 'Check out my projects' }).click();
    await expect(page).toHaveURL(/\/projects\/$/);
    await expect(
        page.getByRole('heading', { level: 2, name: 'Projects' }),
    ).toBeVisible();

    await page.goto('/');
    await page.getByRole('link', { name: 'Contact me' }).click();
    await expect(page).toHaveURL(/\/contact\/$/);
    await expect(
        page.getByRole('heading', { level: 2, name: 'Contact' }),
    ).toBeVisible();
});

test('projects list opens a project detail page', async ({ page }) => {
    const firstProject = PROJECTS[0];

    await page.goto('/projects/');

    await expect(
        page.getByRole('heading', { level: 2, name: 'Projects' }),
    ).toBeVisible();

    await page
        .getByRole('link', {
            name: `View ${firstProject.name} project details`,
        })
        .click();

    await expect(page).toHaveURL(
        `${E2E_BASE_URL}/projects/${firstProject.repo}/`,
    );
    await expect(
        page.getByRole('link', { name: 'Back to Projects' }),
    ).toBeVisible();
    await expect(
        page.getByRole('link', {
            name: `github.com/tenemo/${firstProject.repo}`,
        }),
    ).toHaveAttribute(
        'href',
        `${SITE_LINKS.githubProfile}/${firstProject.repo}`,
    );
});

for (const project of PROJECTS) {
    test(`project route ${project.repo} loads core content`, async ({
        page,
    }) => {
        await page.goto(`/projects/${project.repo}/`);

        await expect(page).toHaveTitle(`${project.name} | piech.dev`);
        await expect(
            page.getByRole('link', { name: 'Back to Projects' }),
        ).toBeVisible();

        const githubLink = page.getByRole('link', {
            name: `github.com/tenemo/${project.repo}`,
        });

        await expect(githubLink).toBeVisible();
        await expect(githubLink).toHaveAttribute(
            'href',
            `${SITE_LINKS.githubProfile}/${project.repo}`,
        );
    });
}

test('contact page renders expected contact methods', async ({ page }) => {
    await page.goto('/contact/');

    await expect(page).toHaveTitle('Contact | piech.dev');
    await expect(
        page.getByRole('link', { name: 'piotr@piech.dev' }),
    ).toHaveAttribute('href', SITE_LINKS.email);
    await expect(page.getByRole('link', { name: '/ppiech' })).toHaveAttribute(
        'href',
        SITE_LINKS.linkedin,
    );
    await expect(page.getByRole('link', { name: '/Tenemo' })).toHaveAttribute(
        'href',
        SITE_LINKS.githubProfile,
    );
    await expect(page.getByRole('link', { name: '@tenemo' })).toHaveAttribute(
        'href',
        SITE_LINKS.telegram,
    );
});

test('representative pages make no same-origin javascript requests', async ({
    page,
}) => {
    const sameOriginJavaScriptRequests: string[] = [];
    const requestListener = (request: { url: () => string }): void => {
        const requestUrl = new URL(request.url());

        if (
            requestUrl.origin === E2E_BASE_URL &&
            requestUrl.pathname.endsWith('.js')
        ) {
            sameOriginJavaScriptRequests.push(requestUrl.pathname);
        }
    };

    page.on('request', requestListener);

    try {
        for (const route of REPRESENTATIVE_ROUTES) {
            sameOriginJavaScriptRequests.length = 0;

            await page.goto(route, { waitUntil: 'load' });

            const sameOriginScriptTags = await page
                .locator('script[src]')
                .evaluateAll(
                    (elements, baseOrigin) =>
                        elements
                            .map((element) => element.getAttribute('src'))
                            .filter((src): src is string => src !== null)
                            .map((src) => new URL(src, baseOrigin))
                            .filter(
                                (url) =>
                                    url.origin === baseOrigin &&
                                    url.pathname.endsWith('.js'),
                            )
                            .map((url) => url.pathname),
                    E2E_BASE_URL,
                );

            expect(
                sameOriginJavaScriptRequests,
                `${route} requested same-origin JavaScript files`,
            ).toEqual([]);
            expect(
                sameOriginScriptTags,
                `${route} includes same-origin script tags`,
            ).toEqual([]);
        }
    } finally {
        page.off('request', requestListener);
    }
});
