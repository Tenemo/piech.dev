import React from 'react';
import type { MetaFunction } from 'react-router';
import type {
    BreadcrumbList,
    SoftwareSourceCode,
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
import ProjectItem from 'features/Projects/ProjectItem/ProjectItem';
import { PROJECTS } from 'features/Projects/projectsList';
import { getImageSize } from 'utils/getImageSize';
import { REPOSITORIES } from 'utils/githubData';

export const meta: MetaFunction = (args) => {
    const repo = args.params.repo ?? '';
    const info = REPOSITORIES[repo];
    const title = `${repo} | piech.dev`;
    const desc =
        info?.description ??
        `Project details for ${repo} from github.com/tenemo/${repo}`;
    const keywords =
        info?.topics && info.topics.length > 0
            ? info.topics.join(', ')
            : DEFAULT_KEYWORDS;

    const projectEntry = PROJECTS.find(
        (p) => (p.repoName ?? p.project) === repo,
    );
    if (!projectEntry) {
        throw new Error(`Project entry not found for repo "${repo}"`);
    }
    const ogImage = projectEntry.ogImage;
    const ogImageAlt = projectEntry.ogImageAlt;

    const size = getImageSize(`${LOCAL_OG_IMAGES_DIRECTORY}${ogImage}`);
    const imageObj: ImageObject = {
        '@type': 'ImageObject',
        '@id': `https://piech.dev/projects/${repo}#image`,
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
        caption: ogImageAlt,
    };

    const breadcrumbList: BreadcrumbList = {
        '@type': 'BreadcrumbList',
        '@id': `https://piech.dev/projects/${repo}#breadcrumb`,
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
            {
                '@type': 'ListItem',
                position: 3,
                name: repo,
                item: `https://piech.dev/projects/${repo}`,
            },
        ],
    };

    const codeId = `https://piech.dev/projects/${repo}#code`;
    const codeNode: SoftwareSourceCode = {
        '@type': 'SoftwareSourceCode',
        '@id': codeId,
        name: repo,
        description: desc,
        url: `https://piech.dev/projects/${repo}`,
        codeRepository: `https://github.com/Tenemo/${repo}`,
        programmingLanguage: 'TypeScript',
        image: { '@id': `https://piech.dev/projects/${repo}#image` },
        keywords: info?.topics,
        dateCreated: info?.createdDatetime,
        dateModified: info?.lastCommitDatetime,
        license: info?.license,
        author: { '@id': PERSON_ID },
        creator: { '@id': PERSON_ID },
        maintainer: { '@id': PERSON_ID },
        mainEntityOfPage: { '@id': `https://piech.dev/projects/${repo}#page` },
    };

    const itemPage: WebPage = {
        '@type': ['WebPage', 'ItemPage'] as unknown as 'WebPage',
        '@id': `https://piech.dev/projects/${repo}#page`,
        url: `https://piech.dev/projects/${repo}`,
        name: `${repo} | piech.dev`,
        description: desc,
        inLanguage: 'en',
        isPartOf: { '@id': WEBSITE_ID },
        mainEntity: { '@id': codeId },
        breadcrumb: { '@id': `https://piech.dev/projects/${repo}#breadcrumb` },
        primaryImageOfPage: {
            '@id': `https://piech.dev/projects/${repo}#image`,
        },
        image: { '@id': `https://piech.dev/projects/${repo}#image` },
        datePublished: info?.createdDatetime,
        dateModified: info?.lastCommitDatetime,
    };

    const graph: Graph = {
        '@context': 'https://schema.org',
        '@graph': [
            WEBSITE,
            itemPage,
            codeNode,
            breadcrumbList,
            PERSON,
            imageObj,
        ],
    };

    return [
        { title },
        { name: 'description', content: desc },
        { name: 'keywords', content: keywords },
        { property: 'og:title', content: title },
        { property: 'og:description', content: desc },
        { property: 'og:type', content: 'article' },
        { property: 'og:url', content: `https://piech.dev/projects/${repo}` },
        {
            property: 'og:image',
            content: `${PRODUCTION_OG_IMAGES_DIRECTORY}${ogImage}`,
        },
        { property: 'og:image:width', content: String(size.width) },
        { property: 'og:image:height', content: String(size.height) },
        { property: 'og:image:alt', content: ogImageAlt },
        {
            tagName: 'link',
            rel: 'canonical',
            href: `https://piech.dev/projects/${repo}`,
        },
        { 'script:ld+json': graph },
    ];
};

const Route = (): React.JSX.Element => <ProjectItem />;
export default Route;
