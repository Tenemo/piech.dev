import React from 'react';
import type { MetaFunction } from 'react-router';

import {
    DEFAULT_KEYWORDS,
    LOCAL_OG_IMAGES_DIRECTORY,
    PRODUCTION_OG_IMAGES_DIRECTORY,
} from 'app/appConstants';
import Projects from 'features/Projects/Projects';
import { getImageSize } from 'utils/getImageSize';

export const meta: MetaFunction = () => {
    const ogImage = 'piech.dev_projects.jpg';
    const size = getImageSize(`${LOCAL_OG_IMAGES_DIRECTORY}${ogImage}`);
    if (!size) {
        throw new Error(
            `Missing size for OG image: public/media/projects/og_images/${ogImage}`,
        );
    }

    return [
        { title: 'Projects | piech.dev' },
        {
            name: 'description',
            content:
                'Non-commercial projects I built in my free time: small tools, libraries, and experiments in React, TypeScript, cryptography, and more.',
        },
        { name: 'keywords', content: DEFAULT_KEYWORDS },
        { property: 'og:title', content: 'Projects | piech.dev' },
        {
            property: 'og:description',
            content:
                'Non-commercial projects I built in my free time: small tools, libraries, and experiments in React, TypeScript, cryptography, and more.',
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
            content: 'Preview image for piech.dev projects.',
        },
        { property: 'og:url', content: 'https://piech.dev/projects/' },
        {
            tagName: 'link',
            rel: 'canonical',
            href: 'https://piech.dev/projects/',
        },
    ];
};

const Route = (): React.JSX.Element => <Projects />;
export default Route;
