import React from 'react';
import type { MetaFunction } from 'react-router';

import ProjectItem from 'features/Projects/ProjectItem/ProjectItem';
import { REPOSITORY_INFO } from 'utils/githubData';

type LinkTag = { rel: string; href: string };

export const meta: MetaFunction = (args) => {
    const repo = args.params.repo ?? '';
    const info = REPOSITORY_INFO[repo];
    const title = `${repo} | piech.dev`;
    const desc =
        info?.description ??
        `Project details for ${repo} from github.com/tenemo/${repo}`;

    return [
        { title },
        { name: 'description', content: desc },
        { property: 'og:title', content: title },
        { property: 'og:description', content: desc },
    ];
};

export const links = (args?: { params?: { repo?: string } }): LinkTag[] => [
    {
        rel: 'canonical',
        href: `https://piech.dev/projects/${args?.params?.repo ?? ''}`,
    },
];

const Route = (): React.JSX.Element => <ProjectItem />;
export default Route;
