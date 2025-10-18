import React from 'react';
import type { MetaFunction } from 'react-router';
import type {
    ListItem,
    SoftwareSourceCode,
    ItemList,
    BreadcrumbList,
    Graph,
    WebPage,
    ImageObject,
} from 'schema-dts';

import { PERSON, PERSON_ID, WEBSITE, WEBSITE_ID } from './index';

import {
    DEFAULT_KEYWORDS,
    LOCAL_OG_IMAGES_DIRECTORY,
    PRODUCTION_OG_IMAGES_DIRECTORY,
} from 'app/appConstants';
import Projects from 'features/Projects/Projects';
import { PROJECTS } from 'features/Projects/projectsList';
import { getImageSize } from 'utils/getImageSize';
import { REPOSITORY_INFO } from 'utils/githubData';

const projectsItemList: ItemList = {
    '@type': 'ItemList',
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    numberOfItems: PROJECTS.length,
    itemListElement: PROJECTS.map<ListItem>(({ repoName, project }, i) => {
        const name = repoName ?? project;
        const code: SoftwareSourceCode = {
            '@type': 'SoftwareSourceCode',
            '@id': `https://piech.dev/projects/${name}#code`,
            name,
            url: `https://piech.dev/projects/${name}`,
            codeRepository: `https://github.com/Tenemo/${name}`,
            programmingLanguage: 'TypeScript',
            author: { '@id': PERSON_ID },
        };
        return {
            '@type': 'ListItem',
            position: i + 1,
            item: code,
        };
    }),
};

const breadcrumbList: BreadcrumbList = {
    '@type': 'BreadcrumbList',
    '@id': 'https://piech.dev/projects/#breadcrumb',
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
            name: 'Projects',
            item: 'https://piech.dev/projects/',
        },
    ],
};

export const meta: MetaFunction = () => {
    const ogImage = 'piech.dev_projects.jpg';
    const size = getImageSize(`${LOCAL_OG_IMAGES_DIRECTORY}${ogImage}`);
    const imageObj: ImageObject = {
        '@type': 'ImageObject',
        '@id': 'https://piech.dev/projects/#main-image',
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
        caption: 'Preview image for piech.dev projects.',
    };

    const collectionPage: WebPage = {
        '@type': ['WebPage', 'CollectionPage'] as unknown as 'WebPage',
        '@id': 'https://piech.dev/projects/#page',
        url: 'https://piech.dev/projects/',
        name: 'Projects | piech.dev',
        description: 'Projects built by Piotr Piech',
        inLanguage: 'en',
        isPartOf: { '@id': WEBSITE_ID },
        author: { '@id': PERSON_ID },
        breadcrumb: { '@id': 'https://piech.dev/projects/#breadcrumb' },
        mainEntity: projectsItemList,
        primaryImageOfPage: { '@id': 'https://piech.dev/projects/#main-image' },
        image: { '@id': 'https://piech.dev/projects/#main-image' },
        datePublished: REPOSITORY_INFO['piech.dev']?.createdDatetime,
        dateModified: new Date().toISOString(),
    };

    const graph: Graph = {
        '@context': 'https://schema.org',
        '@graph': [WEBSITE, collectionPage, breadcrumbList, PERSON, imageObj],
    };

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
        { 'script:ld+json': JSON.stringify(graph) },
    ];
};

const Route = (): React.JSX.Element => <Projects />;
export default Route;
