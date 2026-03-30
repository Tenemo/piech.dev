import type { JSX } from 'react';
import type { MetaFunction } from 'react-router';
import type { Graph, SoftwareSourceCode, WebPage } from 'schema-dts';

import {
    createBreadcrumbList,
    createImageObject,
    createMetaTags,
    getSiteUrl,
} from './seo';

import { PERSON, PERSON_ID, WEBSITE, WEBSITE_ID } from './index';

import { DEFAULT_KEYWORDS } from 'app/appConstants';
import { getProjectPath, HOME_PATH, PROJECTS_PATH } from 'app/routePaths';
import { GITHUB_OWNER, SITE_LINKS } from 'app/siteLinks';
import ProjectItem from 'features/Projects/ProjectItem/ProjectItem';
import { findProjectByRepo } from 'features/Projects/projectUtils';
import { repositoriesData } from 'utils/data/githubData';

export const meta: MetaFunction = ({ params }) => {
    const repo = params.repo ?? '';
    const info = repositoriesData[repo];
    const description =
        info?.description ??
        `Project details for ${repo} from github.com/${GITHUB_OWNER}/${repo}`;
    const keywords =
        info?.topics && info.topics.length > 0
            ? info.topics.join(', ')
            : DEFAULT_KEYWORDS;
    const projectEntry = findProjectByRepo(repo);

    if (!projectEntry) {
        throw new Error(`Project entry not found for repo "${repo}"`);
    }

    const projectPath = getProjectPath(repo);
    const pageUrl = getSiteUrl(projectPath);
    const title = `${projectEntry.name} | piech.dev`;
    const imageId = `${pageUrl}#image`;
    const breadcrumbId = `${pageUrl}#breadcrumb`;
    const pageId = `${pageUrl}#page`;
    const codeId = `${pageUrl}#code`;

    const imageObj = createImageObject({
        id: imageId,
        imageName: projectEntry.ogImage,
        alt: projectEntry.ogImageAlt,
    });

    const breadcrumbList = createBreadcrumbList({
        id: breadcrumbId,
        items: [
            { name: 'Home', path: HOME_PATH },
            { name: 'Projects', path: PROJECTS_PATH },
            { name: projectEntry.name, path: projectPath },
        ],
    });

    const codeNode: SoftwareSourceCode = {
        '@type': 'SoftwareSourceCode',
        '@id': codeId,
        name: projectEntry.name,
        description,
        url: pageUrl,
        codeRepository: `${SITE_LINKS.githubProfile}/${repo}`,
        programmingLanguage: projectEntry.programmingLanguage,
        image: { '@id': imageId },
        keywords: info?.topics,
        dateCreated: info?.createdDatetime,
        dateModified: info?.lastCommitDatetime,
        license: info?.license,
        author: { '@id': PERSON_ID },
        creator: { '@id': PERSON_ID },
        maintainer: { '@id': PERSON_ID },
        mainEntityOfPage: { '@id': pageId },
    };

    const itemPage: WebPage = {
        '@type': ['WebPage', 'ItemPage'] as unknown as 'WebPage',
        '@id': pageId,
        url: pageUrl,
        name: title,
        description,
        inLanguage: 'en',
        isPartOf: { '@id': WEBSITE_ID },
        mainEntity: { '@id': codeId },
        breadcrumb: { '@id': breadcrumbId },
        primaryImageOfPage: { '@id': imageId },
        image: { '@id': imageId },
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

    return createMetaTags({
        title,
        description,
        keywords,
        type: 'article',
        path: projectPath,
        imageName: projectEntry.ogImage,
        imageAlt: projectEntry.ogImageAlt,
        graph,
    });
};

const Route = (): JSX.Element => <ProjectItem />;
export default Route;
