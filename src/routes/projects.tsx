import React from 'react';
import type { MetaFunction } from 'react-router';
import type {
    Graph,
    ImageObject,
    ItemList,
    ListItem,
    SoftwareSourceCode,
    WebPage,
} from 'schema-dts';

import {
    createBreadcrumbList,
    createImageObject,
    createMetaTags,
    getRepositoryDates,
    getSiteUrl,
} from './seo';

import { PERSON, PERSON_ID, WEBSITE, WEBSITE_ID } from './index';

import { DEFAULT_KEYWORDS } from 'app/appConstants';
import { HOME_PATH, PROJECTS_PATH } from 'app/routePaths';
import { SITE_LINKS } from 'app/siteLinks';
import Projects from 'features/Projects/Projects';
import { PROJECTS } from 'features/Projects/projectsData';
import { getProjectRoutePath } from 'features/Projects/projectUtils';

const projectsItemList: ItemList = {
    '@type': 'ItemList',
    '@id': `${getSiteUrl(PROJECTS_PATH)}#list`,
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    numberOfItems: PROJECTS.length,
    itemListElement: PROJECTS.map<ListItem>((project, index) => {
        const url = getSiteUrl(getProjectRoutePath(project.repo));
        const code: SoftwareSourceCode = {
            '@type': 'SoftwareSourceCode',
            '@id': `${url}#code`,
            name: project.name,
            url,
            codeRepository: `${SITE_LINKS.githubProfile}/${project.repo}`,
            programmingLanguage: project.programmingLanguage,
            author: { '@id': PERSON_ID },
        };

        return {
            '@type': 'ListItem',
            position: index + 1,
            item: code,
        };
    }),
};

const breadcrumbList = createBreadcrumbList({
    id: `${getSiteUrl(PROJECTS_PATH)}#breadcrumb`,
    items: [
        { name: 'Home', path: HOME_PATH },
        { name: 'Projects', path: PROJECTS_PATH },
    ],
});

export const meta: MetaFunction = () => {
    const imageId = `${getSiteUrl(PROJECTS_PATH)}#main-image`;
    const imageObj: ImageObject = createImageObject({
        id: imageId,
        imageName: 'piech.dev_projects.jpg',
        alt: 'Preview image for piech.dev projects.',
    });

    const collectionPage: WebPage = {
        '@type': ['WebPage', 'CollectionPage'] as unknown as 'WebPage',
        '@id': `${getSiteUrl(PROJECTS_PATH)}#page`,
        url: getSiteUrl(PROJECTS_PATH),
        name: 'Projects | piech.dev',
        description: 'Projects built by Piotr Piech',
        inLanguage: 'en',
        isPartOf: { '@id': WEBSITE_ID },
        author: { '@id': PERSON_ID },
        breadcrumb: { '@id': `${getSiteUrl(PROJECTS_PATH)}#breadcrumb` },
        mainEntity: projectsItemList,
        primaryImageOfPage: { '@id': imageId },
        image: { '@id': imageId },
        ...getRepositoryDates(),
    };

    const graph: Graph = {
        '@context': 'https://schema.org',
        '@graph': [WEBSITE, collectionPage, breadcrumbList, PERSON, imageObj],
    };

    return createMetaTags({
        title: 'Projects | piech.dev',
        description:
            'Projects I built in my free time: small tools, libraries, and experiments in React, TypeScript, cryptography, and more.',
        keywords: DEFAULT_KEYWORDS,
        type: 'website',
        path: PROJECTS_PATH,
        imageName: 'piech.dev_projects.jpg',
        imageAlt: 'Preview image for piech.dev projects.',
        graph,
    });
};

const Route = (): React.JSX.Element => <Projects />;
export default Route;
