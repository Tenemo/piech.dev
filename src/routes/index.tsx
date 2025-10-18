import React from 'react';
import type { MetaFunction } from 'react-router';
import type {
    EducationalOrganization,
    Person,
    WithContext,
    WebSite,
    AboutPage,
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

export const PERSON: Person = {
    '@type': 'Person',
    '@id': PERSON_ID,
    url: 'https://piech.dev/',
    jobTitle: 'Engineering Manager',
    name: 'Piotr Piech',
    givenName: 'Piotr',
    familyName: 'Piech',
    image: 'https://piech.dev/media/projects/og_images/piotr.jpg',
    email: 'piotr@piech.dev',
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
    knowsAbout: Array.from(
        new Set(
            PROJECTS.flatMap((p) => p.technologies).map(
                (t) => TECHNOLOGIES[t].fullName,
            ),
        ),
    ),
};

const personJsonLd: WithContext<Person> = {
    '@context': 'https://schema.org',
    ...PERSON,
};

export const websiteJsonLd: WithContext<WebSite> = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: 'piech.dev',
    url: 'https://piech.dev/',
    inLanguage: 'en',
    description: "Piotr's personal page.",
    author: { '@id': PERSON_ID },
};

const aboutPageJsonLd: WithContext<AboutPage> = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': ABOUT_ID,
    image: 'https://piech.dev/media/projects/og_images/piotr.jpg',
    url: 'https://piech.dev/',
    name: 'About Piotr Piech',
    description: "Piotr's personal page.",
    inLanguage: 'en',
    mainEntity: { '@id': PERSON_ID },
    publisher: { '@id': PERSON_ID },
};

export const meta: MetaFunction = () => {
    const ogImage = 'piotr.jpg';
    const size = getImageSize(`${LOCAL_OG_IMAGES_DIRECTORY}${ogImage}`);

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
            children: JSON.stringify(personJsonLd),
        },
        {
            tagName: 'script',
            type: 'application/ld+json',
            children: JSON.stringify(websiteJsonLd),
        },
        {
            tagName: 'script',
            type: 'application/ld+json',
            children: JSON.stringify(aboutPageJsonLd),
        },
    ];
};

const Route = (): React.JSX.Element => <About />;
export default Route;
