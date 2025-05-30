import { Helmet } from '@dr.pogodin/react-helmet';
import React from 'react';

import styles from './portfolio.module.scss';
import PortfolioCard from './PortfolioCard/PortfolioCard';
import { TECHNOLOGIES } from './technologies';

const PORTFOLIO_ITEMS: {
    projectPreview: string;
    project: string;
    repoName?: string;
    technologies: (keyof typeof TECHNOLOGIES)[];
}[] = [
    {
        project: 'bob',
        projectPreview: 'bob-demo-movement.mp4',
        technologies: [
            'cpp',
            'platformio',
            'openai',
            'esp32',
            'esp32-s3',
            'typescript',
            'react',
        ],
    },
    {
        project: 'threshold-elgamal',
        projectPreview: 'threshold-elgamal.webp',
        technologies: ['typescript', 'npm', 'typedoc'],
    },
    {
        project: 'sealed.vote',
        repoName: 'sealed-vote-web',
        projectPreview: 'sealed.vote.mp4',
        technologies: [
            'typescript',
            'fastify',
            'postgresql',
            'react',
            'redux',
            'mui',
            'netlify',
            'sentry',
        ],
    },
    {
        project: 'reactplate',
        projectPreview: 'reactplate_lighthouse.webp',
        technologies: [
            'typescript',
            'react',
            'redux',
            'sass',
            'vitejs',
            'eslint',
            'prettier',
            'netlify',
            'sentry',
        ],
    },
    {
        project: 'expressplate',
        projectPreview: 'expressplate.webp',
        technologies: [
            'typescript',
            'nodejs',
            'express',
            'vitejs',
            'eslint',
            'prettier',
            'sentry',
        ],
    },
    {
        project: 'aliases.sh',
        projectPreview: 'aliases.sh.webp',
        technologies: ['bash'],
    },
    // {
    //     project: 'stellaris_mods',
    //     repoName: 'stellaris-mod-slow-play',
    //     projectPreview: 'YYYYYYYYYY',
    //     technologies: [],
    // },
    // {
    //     project: 'tiles.town',
    //     repoName: 'tiles-town',
    //     projectPreview: 'YYYYYYYYY',
    //     technologies: ['typescript', 'react', 'redux', 'netlify', 'sentry'],
    // },
    // {
    //     project: 'particle.golf',
    //     repoName: 'particle-golf',
    //     projectPreview: 'YYYYYYYYYY',
    //     technologies: [],
    // },
];

const Portfolio = (): React.JSX.Element => {
    return (
        <main className={styles.portfolio}>
            <Helmet>
                <title>Portfolio | piech.dev</title>
            </Helmet>
            <h2>Portfolio</h2>
            <div className={'divider'} />

            <div className={styles.portfolioItemsContainer}>
                {PORTFOLIO_ITEMS.map(
                    ({ projectPreview, project, technologies }, index) => (
                        <React.Fragment key={project}>
                            <PortfolioCard
                                imageOnRight={index % 2 === 1}
                                project={project}
                                projectPreview={projectPreview}
                                technologies={technologies}
                                {...(PORTFOLIO_ITEMS[index].repoName
                                    ? {
                                          repoName:
                                              PORTFOLIO_ITEMS[index].repoName,
                                      }
                                    : {})}
                            />
                            <div className="divider" />
                        </React.Fragment>
                    ),
                )}
            </div>
        </main>
    );
};

export default Portfolio;
