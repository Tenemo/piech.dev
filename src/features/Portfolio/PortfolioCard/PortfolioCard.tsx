import React from 'react';

import { TECHNOLOGIES } from '../technologies';

import styles from './portfolioCard.module.scss';

type PortfolioCardProps = {
    children: React.ReactNode;
    imageUrl: string;
    imageAlt: string;
    imageOnRight?: boolean;
    technologies: string[];
};

const PortfolioCard = ({
    children,
    imageUrl,
    imageAlt,
    imageOnRight = false,
    technologies,
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
                        {technologies.map((technologyName) => {
                            const technologyInfo =
                                TECHNOLOGIES[
                                    technologyName as keyof typeof TECHNOLOGIES
                                ];
                            return (
                                <a
                                    href={technologyInfo.url}
                                    key={technologyName}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                    }}
                                    rel="noopener noreferrer"
                                    target="_blank"
                                    title={technologyInfo.fullName}
                                >
                                    <img
                                        alt={`${technologyName} logo`}
                                        className={styles.techLogo}
                                        src={`src/images/logos/${technologyName}_logo.png`}
                                    />
                                </a>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PortfolioCard;
