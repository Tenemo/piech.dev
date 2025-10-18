import React from 'react';
import type { MetaFunction } from 'react-router';
import type { BreadcrumbList, Graph, WebPage, ImageObject } from 'schema-dts';

import { PERSON, PERSON_ID, WEBSITE, WEBSITE_ID } from './index';

import {
    DEFAULT_KEYWORDS,
    LOCAL_OG_IMAGES_DIRECTORY,
    PRODUCTION_OG_IMAGES_DIRECTORY,
} from 'app/appConstants';
import Contact from 'features/Contact/Contact';
import { getImageSize } from 'utils/getImageSize';
import { REPOSITORY_INFO } from 'utils/githubData';

const breadcrumbList: BreadcrumbList = {
    '@type': 'BreadcrumbList',
    '@id': 'https://piech.dev/contact/#breadcrumb',
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
        '@id': 'https://piech.dev/contact/#image',
        contentUrl: `${PRODUCTION_OG_IMAGES_DIRECTORY}${ogImage}`,
        url: `${PRODUCTION_OG_IMAGES_DIRECTORY}${ogImage}`,
        width: {
            '@type': 'QuantitativeValue',
            value: size.width,
            unitText: 'px',
        },
        height: {
            '@type': 'QuantitativeValue',
            value: size.height,
            unitText: 'px',
        },
        caption: 'Screenshot of contact links for Piotr Piech.',
    };

    const pageId = 'https://piech.dev/contact/#page';
    const contactPage: WebPage = {
        '@type': ['WebPage', 'ContactPage'] as unknown as 'WebPage',
        '@id': pageId,
        url: 'https://piech.dev/contact/',
        name: 'Contact | piech.dev',
        description: 'Contact Piotr Piech (email, LinkedIn, GitHub, Telegram).',
        inLanguage: 'en',
        isPartOf: { '@id': WEBSITE_ID },
        mainEntity: { '@id': PERSON_ID },
        breadcrumb: { '@id': 'https://piech.dev/contact/#breadcrumb' },
        primaryImageOfPage: { '@id': 'https://piech.dev/contact/#image' },
        image: { '@id': 'https://piech.dev/contact/#image' },
        datePublished: REPOSITORY_INFO['piech.dev']?.createdDatetime,
        dateModified: REPOSITORY_INFO['piech.dev']?.lastCommitDatetime,
    };

    const graph: Graph = {
        '@context': 'https://schema.org',
        '@graph': [WEBSITE, contactPage, breadcrumbList, PERSON, imageObj],
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
        { 'script:ld+json': graph },
    ];
};

const Route = (): React.JSX.Element => <Contact />;
export default Route;
