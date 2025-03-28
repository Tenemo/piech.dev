import React from 'react';

import styles from './portfolioCard.module.scss';

type PortfolioCardProps = {
    children: React.ReactNode;
    imageUrl: string;
    imageAlt: string;
    imageOnRight?: boolean;
    technologies?: string[]; // Added technologies array prop
};

const PortfolioCard = ({
    children,
    imageUrl,
    imageAlt,
    imageOnRight = false,
    technologies = [], // Default to empty array
}: PortfolioCardProps): React.JSX.Element => {
    return (
        <div
            className={`${styles.card} ${imageOnRight ? styles.imageRight : styles.imageLeft}`}
        >
            <div className={styles.imageContainer}>
                <img alt={imageAlt} className={styles.image} src={imageUrl} />
            </div>
            <div className={styles.content}>
                {children}

                {technologies.length > 0 && (
                    <div className={styles.technologiesContainer}>
                        {technologies.map((technologyName) => (
                            <img
                                alt={`${technologyName} logo`}
                                className={styles.techLogo}
                                key={technologyName}
                                src={`src/images/${technologyName}_logo.png`}
                                title={
                                    technologyName.charAt(0).toUpperCase() +
                                    technologyName.slice(1)
                                }
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PortfolioCard;
