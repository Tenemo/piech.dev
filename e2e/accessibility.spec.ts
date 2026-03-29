import { AxeBuilder } from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { FLAGSHIP_PROJECTS, TOP_LEVEL_PAGES } from './support/siteContracts';
import { gotoRoute } from './support/siteSupport';

type AxeViolations = Awaited<ReturnType<AxeBuilder['analyze']>>['violations'];

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
const ACCESSIBILITY_ROUTES = [
    ...TOP_LEVEL_PAGES.map(({ route }) => route),
    ...FLAGSHIP_PROJECTS.map(({ route }) => route),
];

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
            await gotoRoute(page, route);

            const results = await new AxeBuilder({ page })
                .withTags(WCAG_TAGS)
                .analyze();

            expect(
                results.violations,
                formatViolations(results.violations),
            ).toEqual([]);
        });
    }
});
