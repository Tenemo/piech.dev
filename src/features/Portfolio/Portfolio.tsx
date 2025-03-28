import React from 'react';

import styles from './portfolio.module.scss';
import PortfolioCard from './PortfolioCard/PortfolioCard';

const Portfolio = (): React.JSX.Element => {
    return (
        <main className={styles.portfolio}>
            <h2>Portfolio</h2>
            <div className={'divider'} />

            <div className={styles.portfolioItemsContainer}>
                <PortfolioCard
                    imagePath="images/projects/reactplate_lighthouse.png"
                    project="reactplate"
                    technologies={[
                        'typescript',
                        'react',
                        'redux',
                        'sass',
                        'vitejs',
                        'eslint',
                        'prettier',
                        'netlify',
                        'sentry',
                    ]}
                />
                <PortfolioCard
                    imageOnRight={true}
                    imagePath="images/projects/expressplate.png"
                    project="expressplate"
                    technologies={[
                        'typescript',
                        'nodejs',
                        'express',
                        'vitejs',
                        'eslint',
                        'prettier',
                        'sentry',
                    ]}
                />
            </div>
        </main>
    );
};

export default Portfolio;
