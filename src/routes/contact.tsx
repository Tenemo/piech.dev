import React from 'react';
import type { MetaFunction } from 'react-router';
import type { Graph, WebPage } from 'schema-dts';

import {
    createBreadcrumbList,
    createImageObject,
    createMetaTags,
    getRepositoryDates,
    getSiteUrl,
} from './seo';

import { PERSON, PERSON_ID, WEBSITE, WEBSITE_ID } from './index';

import { DEFAULT_KEYWORDS } from 'app/appConstants';
import { CONTACT_PATH, HOME_PATH } from 'app/routePaths';
import Contact from 'features/Contact/Contact';

const breadcrumbList = createBreadcrumbList({
    id: `${getSiteUrl(CONTACT_PATH)}#breadcrumb`,
    items: [
        { name: 'Home', path: HOME_PATH },
        { name: 'Contact', path: CONTACT_PATH },
    ],
});

export const meta: MetaFunction = () => {
    const imageId = `${getSiteUrl(CONTACT_PATH)}#image`;
    const imageObj = createImageObject({
        id: imageId,
        imageName: 'piech.dev_contact.jpg',
        alt: 'Screenshot of contact links for Piotr Piech.',
    });

    const contactPage: WebPage = {
        '@type': ['WebPage', 'ContactPage'] as unknown as 'WebPage',
        '@id': `${getSiteUrl(CONTACT_PATH)}#page`,
        url: getSiteUrl(CONTACT_PATH),
        name: 'Contact | piech.dev',
        description: 'Contact Piotr Piech (email, LinkedIn, GitHub, Telegram).',
        inLanguage: 'en',
        isPartOf: { '@id': WEBSITE_ID },
        mainEntity: { '@id': PERSON_ID },
        breadcrumb: { '@id': `${getSiteUrl(CONTACT_PATH)}#breadcrumb` },
        primaryImageOfPage: { '@id': imageId },
        image: { '@id': imageId },
        ...getRepositoryDates(),
    };

    const graph: Graph = {
        '@context': 'https://schema.org',
        '@graph': [WEBSITE, contactPage, breadcrumbList, PERSON, imageObj],
    };

    return createMetaTags({
        title: 'Contact | piech.dev',
        description: 'Contact Piotr Piech (email, LinkedIn, GitHub, Telegram).',
        keywords: DEFAULT_KEYWORDS,
        type: 'website',
        path: CONTACT_PATH,
        imageName: 'piech.dev_contact.jpg',
        imageAlt: 'Screenshot of contact links for Piotr Piech.',
        graph,
    });
};

const Route = (): React.JSX.Element => <Contact />;
export default Route;
