import { Helmet } from '@dr.pogodin/react-helmet';
import React from 'react';

import styles from './portfolio.module.scss';
import PortfolioCard from './PortfolioCard/PortfolioCard';
import { PROJECTS } from './projects';

const Portfolio = (): React.JSX.Element => {
    return (
        <main className={styles.portfolio}>
            <Helmet>
                <title>Projects | piech.dev</title>
            </Helmet>
            <h2>Projects</h2>
            <div className={'divider'} />
            <p className={'smallHeadline'}>
                Non-commercial projects I did in my free time.
            </p>
            <div className={'divider'} />

            <div className={styles.portfolioItemsContainer}>
                {PROJECTS.map(
                    ({ projectPreview, project, technologies }, index) => (
                        <React.Fragment key={project}>
                            <PortfolioCard
                                imageOnRight={index % 2 === 1}
                                project={project}
                                projectPreview={projectPreview}
                                technologies={technologies}
                                {...(PROJECTS[index].repoName
                                    ? {
                                          repoName: PROJECTS[index].repoName,
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
