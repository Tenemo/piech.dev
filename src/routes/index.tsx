import type { JSX } from 'react';
import type { MetaFunction } from 'react-router';
import type {
    ContactPoint,
    EducationalOrganization,
    Graph,
    Person,
    WebPage,
    WebSite,
} from 'schema-dts';

import {
    createImageObject,
    createMetaTags,
    getRepositoryDates,
    getSiteUrl,
} from './seo';

import { DEFAULT_KEYWORDS } from 'app/appConstants';
import { HOME_PATH } from 'app/routePaths';
import { SITE_LINKS } from 'app/siteLinks';
import About from 'features/About/About';
import { PROJECTS } from 'features/Projects/projectsData';
import { TECHNOLOGIES } from 'features/Projects/technologies';

const alumniOf: EducationalOrganization = {
    '@type': 'EducationalOrganization',
    name: 'Lublin University of Technology',
};

export const PERSON_ID = `${SITE_LINKS.home}#person`;
export const WEBSITE_ID = `${SITE_LINKS.home}#website`;
export const ABOUT_ID = `${SITE_LINKS.home}#about`;
export const PIOTR_IMAGE_ID = `${SITE_LINKS.home}#piotr-image`;

const CONTACT_POINTS: ContactPoint[] = [
    {
        '@type': 'ContactPoint',
        contactType: 'general inquiries',
        email: SITE_LINKS.emailAddress,
        availableLanguage: ['en', 'pl', 'ru'],
    },
    {
        '@type': 'ContactPoint',
        contactType: 'social',
        url: SITE_LINKS.linkedin,
        availableLanguage: ['en', 'pl', 'ru'],
    },
    {
        '@type': 'ContactPoint',
        contactType: 'code repositories',
        url: SITE_LINKS.githubProfile,
        availableLanguage: ['en', 'pl', 'ru'],
    },
    {
        '@type': 'ContactPoint',
        contactType: 'general inquiries',
        url: SITE_LINKS.telegram,
        availableLanguage: ['en', 'pl', 'ru'],
    },
];

export const PERSON: Person = {
    '@type': 'Person',
    '@id': PERSON_ID,
    url: SITE_LINKS.home,
    jobTitle: 'Engineering Manager',
    name: 'Piotr Piech',
    givenName: 'Piotr',
    familyName: 'Piech',
    image: { '@id': PIOTR_IMAGE_ID },
    email: SITE_LINKS.emailAddress,
    description:
        'Engineering Manager & Software Architect specializing in full-stack web development.',
    alumniOf,
    sameAs: [
        SITE_LINKS.githubProfile,
        SITE_LINKS.linkedin,
        SITE_LINKS.telegram,
    ],
    address: {
        '@type': 'PostalAddress',
        addressLocality: 'Lublin',
        addressCountry: 'PL',
    },
    knowsLanguage: ['en', 'pl', 'ru'],
    knowsAbout: Array.from(
        new Set(
            PROJECTS.flatMap((project) => project.technologies).map(
                (technology) => TECHNOLOGIES[technology].fullName,
            ),
        ),
    ),
    nationality: {
        '@type': 'Country',
        name: 'Poland',
    },
    workLocation: {
        '@type': 'Place',
        address: {
            '@type': 'PostalAddress',
            addressLocality: 'Lublin',
            addressCountry: 'PL',
        },
    },
    contactPoint: CONTACT_POINTS,
    mainEntityOfPage: { '@id': ABOUT_ID },
};

export const WEBSITE: WebSite = {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: 'piech.dev',
    alternateName: 'Piotr Piech - piech.dev',
    url: SITE_LINKS.home,
    inLanguage: 'en',
    description: "Piotr's personal page.",
    author: { '@id': PERSON_ID },
    publisher: { '@id': PERSON_ID },
    copyrightHolder: { '@id': PERSON_ID },
    ...getRepositoryDates(),
};

export const meta: MetaFunction = () => {
    const portrait = createImageObject({
        id: PIOTR_IMAGE_ID,
        imageName: 'piotr.jpg',
        alt: 'Portrait photo of Piotr Piech.',
    });

    const aboutWebPage: WebPage = {
        '@type': [
            'WebPage',
            'AboutPage',
            'ProfilePage',
        ] as unknown as 'WebPage',
        '@id': ABOUT_ID,
        url: getSiteUrl(HOME_PATH),
        name: 'About Piotr Piech',
        description: "Piotr's personal page.",
        inLanguage: 'en',
        isPartOf: { '@id': WEBSITE_ID },
        mainEntity: { '@id': PERSON_ID },
        primaryImageOfPage: { '@id': PIOTR_IMAGE_ID },
        image: { '@id': PIOTR_IMAGE_ID },
        ...getRepositoryDates(),
    };

    const graph: Graph = {
        '@context': 'https://schema.org',
        '@graph': [WEBSITE, aboutWebPage, PERSON, portrait],
    };

    return createMetaTags({
        title: 'piech.dev',
        description: "Piotr's personal page.",
        keywords: DEFAULT_KEYWORDS,
        type: 'profile',
        path: HOME_PATH,
        imageName: 'piotr.jpg',
        imageAlt: 'Portrait photo of Piotr Piech.',
        extra: [
            { property: 'profile:first_name', content: 'Piotr' },
            { property: 'profile:last_name', content: 'Piech' },
        ],
        graph,
    });
};

const Route = (): JSX.Element => <About />;
export default Route;
