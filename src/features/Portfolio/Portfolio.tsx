import React from 'react';

import styles from './portfolio.module.scss';
import PortfolioCard from './PortfolioCard/PortfolioCard';

const Portfolio = (): React.JSX.Element => {
    return (
        <main className={styles.portfolio}>
            <h2>Portfolio</h2>

            <PortfolioCard
                imageAlt="Project 1 image"
                imageUrl="/path/to/image1.jpg"
            >
                <h3>Project 1</h3>
                <p>[TODO: Project 1 description]</p>
            </PortfolioCard>

            <PortfolioCard
                imageAlt="Project 2 image"
                imageOnRight={true}
                imageUrl="/path/to/image2.jpg"
            >
                <h3>Project 2</h3>
                <p>[TODO: Project 2 description]</p>
            </PortfolioCard>
        </main>
    );
};

export default Portfolio;
