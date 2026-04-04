import { expect, test } from '@playwright/test';

import { E2E_BASE_URL } from './support/e2eConfig';
import { PRODUCTION_SITE_ORIGIN } from './support/siteContracts';

test('robots.txt allows crawling and advertises the sitemap', async ({
    request,
}) => {
    const response = await request.get(`${E2E_BASE_URL}/robots.txt`);

    expect(response.ok()).toBe(true);

    const robots = await response.text();

    expect(robots).toContain('User-agent: *');
    expect(robots).toContain('Allow: /');
    expect(robots).toContain(`Sitemap: ${PRODUCTION_SITE_ORIGIN}/sitemap.xml`);
});
