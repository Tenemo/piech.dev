import React from 'react';
import { Link } from 'react-router';

import styles from './portfolio.module.scss';
import PortfolioCard from './PortfolioCard/PortfolioCard';

const Portfolio = (): React.JSX.Element => {
    return (
        <main className={styles.portfolio}>
            <h2>Portfolio</h2>

            <Link to="/portfolio/reactplate">
                <PortfolioCard
                    imageAlt="Reactplate project"
                    imageUrl="/path/to/image1.jpg"
                >
                    <h3>Reactplate</h3>
                    <p>A React template. TODO: longer description</p>
                </PortfolioCard>
            </Link>

            <Link to="/portfolio/expressplate">
                <PortfolioCard
                    imageAlt="Expressplate project"
                    imageOnRight={true}
                    imageUrl="/path/to/image2.jpg"
                >
                    <h3>Expressplate</h3>
                    <p>An Express.js template. TODO: longer description</p>
                </PortfolioCard>
            </Link>
        </main>
    );
};

export default Portfolio;
