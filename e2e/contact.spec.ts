import { expect, test } from '@playwright/test';

import { CONTACT_LINK_CONTRACTS, CONTACT_PAGE } from './support/siteContracts';
import { expectTopLevelPageLoaded, gotoRoute } from './support/siteSupport';

test('contact page renders expected contact methods and link attributes', async ({
    page,
}) => {
    await gotoRoute(page, CONTACT_PAGE.route);

    await expectTopLevelPageLoaded(page, CONTACT_PAGE);

    for (const contactLinkContract of CONTACT_LINK_CONTRACTS) {
        await test.step(contactLinkContract.label, async () => {
            const contactLink = page.getByRole('link', {
                name: contactLinkContract.label,
            });

            await expect(contactLink).toHaveAttribute(
                'href',
                contactLinkContract.href,
            );

            if (contactLinkContract.opensInNewTab) {
                await expect(contactLink).toHaveAttribute('target', '_blank');
                await expect(contactLink).toHaveAttribute(
                    'rel',
                    'noopener noreferrer',
                );
            } else {
                await expect(contactLink).not.toHaveAttribute('target', /.+/);
                await expect(contactLink).not.toHaveAttribute('rel', /.+/);
            }
        });
    }
});
