import React from 'react';

import styles from './portfolio.module.scss';
import PortfolioCard from './PortfolioCard/PortfolioCard';
import { TECHNOLOGIES } from './technologies';

const PORTFOLIO_ITEMS: {
    previewImage: string;
    project: string;
    repoName?: string;
    technologies: (keyof typeof TECHNOLOGIES)[];
}[] = [
    {
        previewImage: 'reactplate_lighthouse.png',
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
        previewImage: 'YYYYYYYYY',
        project: 'threshold-elgamal',
        technologies: ['typescript', 'npm'],
    },
    {
        previewImage: 'YYYYYYYYY',
        project: 'sealed.vote',
        repoName: 'sealed-vote-web',
        technologies: [
            'typescript',
            'fastify',
            'postgresql',
            'react',
            'redux',
            'mui',
            'jest',
        ],
    },
    {
        previewImage: 'YYYYYYYYY',
        project: 'bob',
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
        previewImage: 'expressplate.png',
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
        previewImage: 'aliases.sh.png',
        project: 'aliases.sh',
        technologies: ['bash'],
    },
    {
        previewImage: 'YYYYYYYYY',
        project: 'tiles.town',
        repoName: 'tiles-town',
        technologies: ['typescript', 'react', 'redux', 'netlify', 'sentry'],
    },
];

const Portfolio = (): React.JSX.Element => {
    return (
        <main className={styles.portfolio}>
            <h2>Portfolio</h2>
            <div className={'divider'} />

            <div className={styles.portfolioItemsContainer}>
                {PORTFOLIO_ITEMS.map(
                    ({ previewImage, project, technologies }, index) => (
                        <>
                            <PortfolioCard
                                imageOnRight={index % 2 === 1}
                                key={project}
                                previewImage={previewImage}
                                project={project}
                                technologies={technologies}
                                {...(PORTFOLIO_ITEMS[index].repoName
                                    ? {
                                          repoName:
                                              PORTFOLIO_ITEMS[index].repoName,
                                      }
                                    : {})}
                            />
                            <div className="divider" />
                        </>
                    ),
                )}
            </div>
        </main>
    );
};

export default Portfolio;
