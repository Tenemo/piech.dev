import React from 'react';
import type { MetaFunction } from 'react-router';
import type {
    ContactPoint,
    Person,
    BreadcrumbList,
    Graph,
    WebSite,
    WebPage,
    ImageObject,
} from 'schema-dts';

import { PERSON_ID, WEBSITE_ID } from './index';

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
        contactType: 'general inquiries',
        email: 'mailto:piotr@piech.dev',
        availableLanguage: ['en', 'pl', 'ru'],
    },
    {
        '@type': 'ContactPoint',
        contactType: 'social',
        url: 'https://www.linkedin.com/in/ppiech',
        availableLanguage: ['en', 'pl', 'ru'],
    },
    {
        '@type': 'ContactPoint',
        contactType: 'code repositories',
        url: 'https://github.com/Tenemo',
        availableLanguage: ['en', 'pl', 'ru'],
    },
    {
        '@type': 'ContactPoint',
        contactType: 'general inquiries',
        url: 'https://t.me/tenemo',
        availableLanguage: ['en', 'pl', 'ru'],
    },
];

const breadcrumbList: BreadcrumbList = {
    '@type': 'BreadcrumbList',
    itemListElement: [
        {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://piech.dev/',
        },
        {
            '@type': 'ListItem',
            position: 2,
            name: 'Contact',
            item: 'https://piech.dev/contact/',
        },
    ],
};

export const meta: MetaFunction = () => {
    const ogImage = 'piech.dev_contact.jpg';
    const size = getImageSize(`${LOCAL_OG_IMAGES_DIRECTORY}${ogImage}`);
    const imageObj: ImageObject = {
        '@type': 'ImageObject',
        url: `${PRODUCTION_OG_IMAGES_DIRECTORY}${ogImage}`,
        width: { '@type': 'QuantitativeValue', value: size.width },
        height: { '@type': 'QuantitativeValue', value: size.height },
        caption: 'Screenshot of contact links for Piotr Piech.',
    };

    const websiteNode: WebSite = {
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        name: 'piech.dev',
        alternateName: 'Piotr Piech — piech.dev',
        url: 'https://piech.dev/',
        inLanguage: 'en',
        description: "Piotr's personal page.",
        author: { '@id': PERSON_ID },
        publisher: { '@id': PERSON_ID },
        copyrightHolder: { '@id': PERSON_ID },
    };

    const pageId = 'https://piech.dev/contact/#page';
    const contactPage = {
        '@type': ['WebPage', 'ContactPage'],
        '@id': pageId,
        url: 'https://piech.dev/contact/',
        name: 'Contact | piech.dev',
        description: 'Contact Piotr Piech (email, LinkedIn, GitHub, Telegram).',
        inLanguage: 'en',
        isPartOf: { '@id': WEBSITE_ID },
        mainEntity: { '@id': PERSON_ID },
        primaryImageOfPage: imageObj,
    } as unknown as WebPage;

    const personPartial: Person = {
        '@type': 'Person',
        '@id': PERSON_ID,
        mainEntityOfPage: { '@id': pageId },
        contactPoint: contactPoints,
    };

    const graph: Graph = {
        '@context': 'https://schema.org',
        '@graph': [websiteNode, contactPage, breadcrumbList, personPartial],
    };

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
            children: JSON.stringify(graph),
        },
    ];
};

const Route = (): React.JSX.Element => <Contact />;
export default Route;
