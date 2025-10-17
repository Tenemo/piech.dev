import React from 'react';
import type { MetaFunction } from 'react-router';

import {
    DEFAULT_KEYWORDS,
    LOCAL_OG_IMAGES_DIRECTORY,
    PRODUCTION_OG_IMAGES_DIRECTORY,
} from 'app/appConstants';
import About from 'features/About/About';
import { getImageSize } from 'utils/getImageSize';

export const meta: MetaFunction = () => {
    const ogImage = 'piotr.jpg';
    const size = getImageSize(`${LOCAL_OG_IMAGES_DIRECTORY}${ogImage}`);

    return [
        { title: 'piech.dev' },
        { name: 'description', content: "Piotr's personal page." },
        {
            name: 'keywords',
            content: DEFAULT_KEYWORDS,
        },
        { property: 'og:title', content: 'piech.dev' },
        { property: 'og:description', content: "Piotr's personal page." },
        { property: 'og:type', content: 'profile' },
        { property: 'profile:first_name', content: 'Piotr' },
        { property: 'profile:last_name', content: 'Piech' },
        { property: 'og:url', content: 'https://piech.dev/' },
        {
            property: 'og:image',
            content: `${PRODUCTION_OG_IMAGES_DIRECTORY}${ogImage}`,
        },
        { property: 'og:image:width', content: String(size.width) },
        { property: 'og:image:height', content: String(size.height) },
        {
            property: 'og:image:alt',
            content: 'Portrait photo of Piotr Piech.',
        },
        { tagName: 'link', rel: 'canonical', href: 'https://piech.dev/' },
    ];
};

const Route = (): React.JSX.Element => <About />;
export default Route;
