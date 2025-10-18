import React from 'react';
import type { MetaFunction } from 'react-router';
import type {
    EducationalOrganization,
    Person,
    WebSite,
    Graph,
    WebPage,
    AboutPage,
    ProfilePage,
} from 'schema-dts';

import {
    DEFAULT_KEYWORDS,
    LOCAL_OG_IMAGES_DIRECTORY,
    PRODUCTION_OG_IMAGES_DIRECTORY,
} from 'app/appConstants';
import About from 'features/About/About';
import { PROJECTS } from 'features/Projects/projectsList';
import { TECHNOLOGIES } from 'features/Projects/technologies';
import { getImageSize } from 'utils/getImageSize';

const alumniOf: EducationalOrganization = {
    '@type': 'EducationalOrganization',
    name: 'Lublin University of Technology',
};

export const PERSON_ID = 'https://piech.dev/#person';
export const WEBSITE_ID = 'https://piech.dev/#website';
export const ABOUT_ID = 'https://piech.dev/#about';
export const PERSON_IMAGE_ID = 'https://piech.dev/#person-image';

export const PERSON: Person = {
    '@type': 'Person',
    '@id': PERSON_ID,
    url: 'https://piech.dev/',
    jobTitle: 'Engineering Manager',
    name: 'Piotr Piech',
    givenName: 'Piotr',
    familyName: 'Piech',
    image: 'https://piech.dev/media/projects/og_images/piotr.jpg',
    email: 'mailto:piotr@piech.dev',
    alumniOf,
    sameAs: [
        'https://github.com/Tenemo',
        'https://www.linkedin.com/in/ppiech',
        'https://t.me/tenemo',
    ],
    address: {
        '@type': 'PostalAddress',
        addressLocality: 'Lublin',
        addressCountry: 'PL',
    },
    knowsLanguage: ['en', 'pl', 'ru'],
    knowsAbout: Array.from(
        new Set(
            PROJECTS.flatMap((p) => p.technologies).map(
                (t) => TECHNOLOGIES[t].fullName,
            ),
        ),
    ),
    mainEntityOfPage: { '@id': ABOUT_ID },
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

export const meta: MetaFunction = () => {
    const ogImage = 'piotr.jpg';
    const size = getImageSize(`${LOCAL_OG_IMAGES_DIRECTORY}${ogImage}`);
    const portrait = {
        '@type': 'ImageObject',
        '@id': PERSON_IMAGE_ID,
        url: `${PRODUCTION_OG_IMAGES_DIRECTORY}${ogImage}`,
        width: { '@type': 'QuantitativeValue', value: size.width },
        height: { '@type': 'QuantitativeValue', value: size.height },
        caption: 'Portrait photo of Piotr Piech.',
    } as const;

    const aboutWebPage: WebPage | (AboutPage & ProfilePage) = {
        '@type': ['WebPage', 'AboutPage', 'ProfilePage'],
        '@id': ABOUT_ID,
        url: 'https://piech.dev/',
        name: 'About Piotr Piech',
        description: "Piotr's personal page.",
        inLanguage: 'en',
        isPartOf: { '@id': WEBSITE_ID },
        mainEntity: { '@id': PERSON_ID },
        primaryImageOfPage: { '@id': PERSON_IMAGE_ID },
    } as unknown as WebPage;

    const personNode: Person = {
        ...PERSON,
        image: { '@id': PERSON_IMAGE_ID },
    };

    const graph: Graph = {
        '@context': 'https://schema.org',
        '@graph': [websiteNode, aboutWebPage, personNode, portrait],
    };

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
        {
            tagName: 'script',
            type: 'application/ld+json',
            children: JSON.stringify(graph),
        },
    ];
};

const Route = (): React.JSX.Element => <About />;
export default Route;
