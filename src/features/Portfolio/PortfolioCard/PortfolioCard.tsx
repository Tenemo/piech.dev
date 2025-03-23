import React from 'react';

import styles from './portfolioCard.module.scss';

type PortfolioCardProps = {
    children: React.ReactNode;
    imageUrl: string;
    imageAlt: string;
    imageOnRight?: boolean;
};

const PortfolioCard = ({
    children,
    imageUrl,
    imageAlt,
    imageOnRight = false,
}: PortfolioCardProps): React.JSX.Element => {
    return (
        <div
            className={`${styles.card} ${imageOnRight ? styles.imageRight : styles.imageLeft}`}
        >
            <div className={styles.imageContainer}>
                <img alt={imageAlt} className={styles.image} src={imageUrl} />
            </div>
            <div className={styles.content}>{children}</div>
        </div>
    );
};

export default PortfolioCard;
