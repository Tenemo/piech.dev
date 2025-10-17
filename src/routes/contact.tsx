import React from 'react';
import type { MetaFunction } from 'react-router';

import {
    DEFAULT_KEYWORDS,
    LOCAL_OG_IMAGES_DIRECTORY,
    PRODUCTION_OG_IMAGES_DIRECTORY,
} from 'app/appConstants';
import Contact from 'features/Contact/Contact';
import { getImageSize } from 'utils/getImageSize';

export const meta: MetaFunction = () => {
    const ogImage = 'piech.dev_contact.jpg';
    const size = getImageSize(`${LOCAL_OG_IMAGES_DIRECTORY}${ogImage}`);

    return [
        { title: 'Contact | piech.dev' },
        {
            name: 'description',
            content: 'Contact Piotr Piech (email, LinkedIn, GitHub, Telegram).',
        },
        { name: 'keywords', content: DEFAULT_KEYWORDS },
        { property: 'og:title', content: 'Contact | piech.dev' },
        {
            property: 'og:description',
            content: 'Contact Piotr Piech (email, LinkedIn, GitHub, Telegram).',
        },
        { property: 'og:type', content: 'website' },
        {
            property: 'og:image',
            content: `${PRODUCTION_OG_IMAGES_DIRECTORY}${ogImage}`,
        },
        { property: 'og:image:width', content: String(size.width) },
        { property: 'og:image:height', content: String(size.height) },
        {
            property: 'og:image:alt',
            content: 'Screenshot of contact links for Piotr Piech.',
        },
        { property: 'og:url', content: 'https://piech.dev/contact/' },
        {
            tagName: 'link',
            rel: 'canonical',
            href: 'https://piech.dev/contact/',
        },
    ];
};

const Route = (): React.JSX.Element => <Contact />;
export default Route;
