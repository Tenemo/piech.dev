import React from 'react';
import type { MetaFunction } from 'react-router';
import type {
    BreadcrumbList,
    SoftwareSourceCode,
    WithContext,
} from 'schema-dts';

import { PERSON_ID } from './index';

import {
    DEFAULT_KEYWORDS,
    LOCAL_OG_IMAGES_DIRECTORY,
    PRODUCTION_OG_IMAGES_DIRECTORY,
} from 'app/appConstants';
import ProjectItem from 'features/Projects/ProjectItem/ProjectItem';
import { PROJECTS } from 'features/Projects/projectsList';
import { getImageSize } from 'utils/getImageSize';
import { REPOSITORY_INFO } from 'utils/githubData';

export const meta: MetaFunction = (args) => {
    const repo = args.params.repo ?? '';
    const info = REPOSITORY_INFO[repo];
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
    const projectJsonLd: WithContext<SoftwareSourceCode> = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareSourceCode',
        name: repo,
        description: desc,
        url: `https://piech.dev/projects/${repo}`,
        codeRepository: `https://github.com/Tenemo/${repo}`,
        programmingLanguage: 'TypeScript',
        keywords: info?.topics,
        dateCreated: info?.createdDatetime,
        author: { '@id': PERSON_ID },
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
            {
                '@type': 'ListItem',
                position: 3,
                name: repo,
            },
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
        {
            tagName: 'script',
            type: 'application/ld+json',
            children: JSON.stringify(projectJsonLd),
        },
        {
            tagName: 'script',
            type: 'application/ld+json',
            children: JSON.stringify(breadcrumbJsonLd),
        },
    ];
};

const Route = (): React.JSX.Element => <ProjectItem />;
export default Route;
