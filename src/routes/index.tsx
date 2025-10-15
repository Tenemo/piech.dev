import React from 'react';
import type { MetaFunction } from 'react-router';

import About from 'features/About/About';

export const meta: MetaFunction = () => [
    { title: 'piech.dev' },
    { name: 'description', content: "Piotr's personal page." },
    { property: 'og:title', content: 'piech.dev' },
    { property: 'og:description', content: "Piotr's personal page." },
    { property: 'og:url', content: 'https://piech.dev/' },
];

export const links = (): { rel: string; href: string }[] => [
    { rel: 'canonical', href: 'https://piech.dev/' },
];

const Route = (): React.JSX.Element => <About />;
export default Route;
