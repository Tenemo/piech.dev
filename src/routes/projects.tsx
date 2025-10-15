import React from 'react';
import type { MetaFunction } from 'react-router';

import Projects from 'features/Projects/Projects';

export const meta: MetaFunction = () => [
    { title: 'Projects | piech.dev' },
    {
        name: 'description',
        content:
            'Non-commercial projects I built in my free time: small tools, libraries, and experiments in React, TypeScript, cryptography, and more.',
    },
    { property: 'og:title', content: 'Projects | piech.dev' },
    {
        property: 'og:description',
        content:
            'Non-commercial projects I built in my free time: small tools, libraries, and experiments in React, TypeScript, cryptography, and more.',
    },
    { property: 'og:url', content: 'https://piech.dev/projects/' },
    {
        tagName: 'link',
        rel: 'canonical',
        href: 'https://piech.dev/projects/',
    },
];

const Route = (): React.JSX.Element => <Projects />;
export default Route;
