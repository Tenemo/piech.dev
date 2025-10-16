import React from 'react';
import type { MetaFunction } from 'react-router';

import { DEFAULT_KEYWORDS } from 'constants/seo';
import Contact from 'features/Contact/Contact';

export const meta: MetaFunction = () => [
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
    { property: 'og:url', content: 'https://piech.dev/contact/' },
    {
        tagName: 'link',
        rel: 'canonical',
        href: 'https://piech.dev/contact/',
    },
];

const Route = (): React.JSX.Element => <Contact />;
export default Route;
