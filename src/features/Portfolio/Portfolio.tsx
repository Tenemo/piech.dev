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
                    imageAlt="Reactplate project and its lighthouse scores"
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
                >
                    <h3>Reactplate</h3>
                    <p>A React template. TODO: longer description</p>
                </PortfolioCard>

                <PortfolioCard
                    imageAlt="Expressplate project"
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
                >
                    <h3>Expressplate</h3>
                    <p>An Express.js template. TODO: longer description</p>
                </PortfolioCard>
            </div>
        </main>
    );
};

export default Portfolio;
