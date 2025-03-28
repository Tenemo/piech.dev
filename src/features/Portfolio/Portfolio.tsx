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
                    imageUrl="src/images/projects/reactplate_lighthouse.png"
                    project="reactplate"
                    technologies={[
                        'typescript',
                        'react',
                        'redux',
                        'sass',
                        'vitejs',
                        'eslint',
                        'prettier',
                    ]}
                />
                <PortfolioCard
                    imageOnRight={true}
                    imageUrl="/path/to/image2.jpg"
                    project="expressplate"
                    technologies={[
                        'nodejs',
                        'typescript',
                        'express',
                        'vitejs',
                        'eslint',
                        'prettier',
                    ]}
                />
            </div>
        </main>
    );
};

export default Portfolio;
