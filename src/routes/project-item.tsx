import React from 'react';
import type { MetaFunction } from 'react-router';

import ProjectItem from 'features/Projects/ProjectItem/ProjectItem';
import { REPOSITORY_INFO } from 'utils/githubData';

export const meta: MetaFunction = (args) => {
    const repo = args.params.repo ?? '';
    const info = REPOSITORY_INFO[repo];
    const title = `${repo} | piech.dev`;
    const desc =
        info?.description ??
        `Project details for ${repo} from github.com/tenemo/${repo}`;
    const defaultKeywords =
        'react, typescript, elgamal, threshold-elgamal, ESP32, reactplate, homomorphic encryption, homomorphic';
    const keywords =
        info?.topics && info.topics.length > 0
            ? info.topics.join(', ')
            : defaultKeywords;

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
