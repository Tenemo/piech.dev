import { AxeBuilder } from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { PROJECTS } from '../src/features/Projects/projectsData';
import { getProjectRoutePath } from '../src/features/Projects/projectUtils';

type AxeViolations = Awaited<ReturnType<AxeBuilder['analyze']>>['violations'];

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
const ACCESSIBILITY_ROUTES = [
    '/',
    '/projects/',
    '/contact/',
    ...PROJECTS.map(({ repo }) => getProjectRoutePath(repo)),
];
const DESKTOP_KEYBOARD_PROJECTS = new Set([
    'Desktop Chrome',
    'Desktop Firefox',
]);

const formatViolations = (violations: AxeViolations): string => {
    if (violations.length === 0) {
        return 'No accessibility violations found.';
    }

    return violations
        .map(({ id, impact, description, help, nodes }) =>
            [
                `${id} (${impact ?? 'unknown impact'})`,
                `${help}: ${description}`,
                ...nodes.map(
                    ({ target, failureSummary }) =>
                        `  - ${target
                            .map((selector) => String(selector))
                            .join(
                                ', ',
                            )}${failureSummary ? `\n    ${failureSummary}` : ''}`,
                ),
            ].join('\n'),
        )
        .join('\n\n');
};

test.describe('accessibility automation', () => {
    for (const route of ACCESSIBILITY_ROUTES) {
        test(`axe scan passes for ${route}`, async ({ page }) => {
            await page.goto(route, { waitUntil: 'load' });

            const results = await new AxeBuilder({ page })
                .withTags(WCAG_TAGS)
                .analyze();

            expect(
                results.violations,
                formatViolations(results.violations),
            ).toEqual([]);
        });
    }

    test('keyboard users reach the skip link before the primary navigation', async ({
        page,
    }, testInfo) => {
        test.skip(
            !DESKTOP_KEYBOARD_PROJECTS.has(testInfo.project.name),
            'Tab-order checks are only reliable in desktop keyboard-first projects.',
        );

        await page.goto('/');

        await page.keyboard.press('Tab');

        await expect(
            page.getByRole('link', { name: 'Skip to main content' }),
        ).toBeFocused();
    });
});
