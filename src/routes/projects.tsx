import React from 'react';
import type { MetaFunction } from 'react-router';
import type {
    CollectionPage,
    ListItem,
    SoftwareSourceCode,
    WithContext,
    ItemList,
    BreadcrumbList,
} from 'schema-dts';

import {
    DEFAULT_KEYWORDS,
    LOCAL_OG_IMAGES_DIRECTORY,
    PRODUCTION_OG_IMAGES_DIRECTORY,
} from 'app/appConstants';
import Projects from 'features/Projects/Projects';
import { PROJECTS } from 'features/Projects/projectsList';
import { getImageSize } from 'utils/getImageSize';

const projectsItemList: ItemList = {
    '@type': 'ItemList',
    itemListElement: PROJECTS.map<ListItem>(({ repoName, project }, i) => {
        const name = repoName ?? project;
        const code: SoftwareSourceCode = {
            '@type': 'SoftwareSourceCode',
            '@id': `https://piech.dev/projects/${name}#code`,
            name,
            url: `https://piech.dev/projects/${name}`,
            codeRepository: `https://github.com/Tenemo/${name}`,
            programmingLanguage: 'TypeScript',
        };
        return {
            '@type': 'ListItem',
            position: i + 1,
            item: code,
        };
    }),
};

const collectionJsonLd: WithContext<CollectionPage> = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Projects | piech.dev',
    url: 'https://piech.dev/projects/',
    description: 'Projects built by Piotr Piech',
    inLanguage: 'en',
    mainEntity: projectsItemList,
};

const breadcrumbJsonLd: WithContext<BreadcrumbList> = {
    '@context': 'https://schema.org',
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
            item: 'https://piech.dev/projects/',
        },
    ],
};

export const meta: MetaFunction = () => {
    const ogImage = 'piech.dev_projects.jpg';
    const size = getImageSize(`${LOCAL_OG_IMAGES_DIRECTORY}${ogImage}`);

    return [
        { title: 'Projects | piech.dev' },
        {
            name: 'description',
            content:
                'Projects I built in my free time: small tools, libraries, and experiments in React, TypeScript, cryptography, and more.',
        },
        { name: 'keywords', content: DEFAULT_KEYWORDS },
        { property: 'og:title', content: 'Projects | piech.dev' },
        {
            property: 'og:description',
            content:
                'Projects I built in my free time: small tools, libraries, and experiments in React, TypeScript, cryptography, and more.',
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
            content: 'Preview image for piech.dev projects.',
        },
        { property: 'og:url', content: 'https://piech.dev/projects/' },
        {
            tagName: 'link',
            rel: 'canonical',
            href: 'https://piech.dev/projects/',
        },
        {
            tagName: 'script',
            type: 'application/ld+json',
            children: JSON.stringify(collectionJsonLd),
        },
        {
            tagName: 'script',
            type: 'application/ld+json',
            children: JSON.stringify(breadcrumbJsonLd),
        },
    ];
};

const Route = (): React.JSX.Element => <Projects />;
export default Route;
