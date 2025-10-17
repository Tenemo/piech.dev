import React from 'react';
import type { MetaFunction } from 'react-router';

import { DEFAULT_KEYWORDS } from 'constants/seo';
import About from 'features/About/About';

export const meta: MetaFunction = () => [
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
        content: 'https://piech.dev/media/projects/og_images/piotr.jpg',
    },
    {
        property: 'og:image:alt',
        content: 'Portrait photo of Piotr Piech.',
    },
    { tagName: 'link', rel: 'canonical', href: 'https://piech.dev/' },
];

const Route = (): React.JSX.Element => <About />;
export default Route;
