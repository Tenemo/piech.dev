import React from 'react';
import type { MetaFunction } from 'react-router';
import type {
    ListItem,
    SoftwareSourceCode,
    ItemList,
    BreadcrumbList,
    Graph,
    WebPage,
    WebSite,
    ImageObject,
} from 'schema-dts';

import { PERSON_ID, WEBSITE_ID } from './index';

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
        url: `${PRODUCTION_OG_IMAGES_DIRECTORY}${ogImage}`,
        width: { '@type': 'QuantitativeValue', value: size.width },
        height: { '@type': 'QuantitativeValue', value: size.height },
        caption: 'Preview image for piech.dev projects.',
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

    const collectionPage = {
        '@type': ['WebPage', 'CollectionPage'],
        '@id': 'https://piech.dev/projects/#page',
        url: 'https://piech.dev/projects/',
        name: 'Projects | piech.dev',
        description: 'Projects built by Piotr Piech',
        inLanguage: 'en',
        isPartOf: { '@id': WEBSITE_ID },
        mainEntity: projectsItemList,
        primaryImageOfPage: imageObj,
    } as unknown as WebPage;

    const graph: Graph = {
        '@context': 'https://schema.org',
        '@graph': [websiteNode, collectionPage, breadcrumbList],
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
        {
            tagName: 'script',
            type: 'application/ld+json',
            children: JSON.stringify(graph),
        },
    ];
};

const Route = (): React.JSX.Element => <Projects />;
export default Route;
