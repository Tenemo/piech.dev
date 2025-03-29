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
        projectPreview: 'reactplate_lighthouse.png',
        project: 'reactplate',
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
        projectPreview: 'threshold-elgamal.png',
        project: 'threshold-elgamal',
        technologies: ['typescript', 'npm', 'typedoc'],
    },
    {
        projectPreview: 'sealed.vote.mp4',
        project: 'sealed.vote',
        repoName: 'sealed-vote-web',
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
    // {
    //     projectPreview: 'YYYYYYYYY',
    //     project: 'bob',
    //     technologies: [
    //         'cpp',
    //         'platformio',
    //         'openai',
    //         'esp32',
    //         'esp32-s3',
    //         'typescript',
    //         'react',
    //     ],
    // },
    {
        projectPreview: 'expressplate.png',
        project: 'expressplate',
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
        projectPreview: 'aliases.sh.png',
        project: 'aliases.sh',
        technologies: ['bash'],
    },
    // {
    //     project: 'stellaris_mods',
    //     repoName: 'stellaris-mod-slow-play',
    //     projectPreview: 'YYYYYYYYYY',
    //     technologies: [],
    // },
    // {
    //     projectPreview: 'YYYYYYYYY',
    //     project: 'tiles.town',
    //     repoName: 'tiles-town',
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
