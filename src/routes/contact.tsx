import React from 'react';
import type { MetaFunction } from 'react-router';
import type {
    ContactPoint,
    ContactPage,
    WithContext,
    Person,
} from 'schema-dts';

import { PERSON_ID } from './index';

import {
    DEFAULT_KEYWORDS,
    LOCAL_OG_IMAGES_DIRECTORY,
    PRODUCTION_OG_IMAGES_DIRECTORY,
} from 'app/appConstants';
import Contact from 'features/Contact/Contact';
import { getImageSize } from 'utils/getImageSize';

const contactPoints: ContactPoint[] = [
    {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: 'piotr@piech.dev',
    },
    {
        '@type': 'ContactPoint',
        contactType: 'social',
        url: 'https://www.linkedin.com/in/ppiech',
    },
    {
        '@type': 'ContactPoint',
        contactType: 'code repository',
        url: 'https://github.com/Tenemo',
    },
    {
        '@type': 'ContactPoint',
        contactType: 'messaging',
        url: 'https://t.me/tenemo',
    },
];

const contactPageJsonLd: WithContext<ContactPage> = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    '@id': 'https://piech.dev/contact/#page',
    url: 'https://piech.dev/contact/',
    name: 'Contact | piech.dev',
    about: { '@id': PERSON_ID },
};

const personContactJsonLd: WithContext<Person> = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': PERSON_ID,
    contactPoint: contactPoints,
};

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
        {
            tagName: 'script',
            type: 'application/ld+json',
            children: JSON.stringify(contactPageJsonLd),
        },
        {
            tagName: 'script',
            type: 'application/ld+json',
            children: JSON.stringify(personContactJsonLd),
        },
    ];
};

const Route = (): React.JSX.Element => <Contact />;
export default Route;
