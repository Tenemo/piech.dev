import React from 'react';
import type { MetaFunction } from 'react-router';

import { DEFAULT_KEYWORDS } from 'constants/seo';
import ProjectItem from 'features/Projects/ProjectItem/ProjectItem';
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

    return [
        { title },
        { name: 'description', content: desc },
        { name: 'keywords', content: keywords },
        { property: 'og:title', content: title },
        { property: 'og:description', content: desc },
        { property: 'og:url', content: `https://piech.dev/projects/${repo}` },
        {
            tagName: 'link',
            rel: 'canonical',
            href: `https://piech.dev/projects/${repo}`,
        },
    ];
};

const Route = (): React.JSX.Element => <ProjectItem />;
export default Route;
