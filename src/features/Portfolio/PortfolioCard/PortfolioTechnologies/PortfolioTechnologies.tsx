import React from 'react';

import { TECHNOLOGIES } from '../../technologies';

import styles from './portfolioTechnologies.module.scss';

type PortfolioTechnologiesProps = {
    technologies: (keyof typeof TECHNOLOGIES)[];
};

const PortfolioTechnologies = ({
    technologies,
}: PortfolioTechnologiesProps): React.JSX.Element => {
    if (technologies.length === 0) {
        return <></>;
    }

    return (
        <div className={styles.technologiesContainer}>
            {technologies.map((technologyName) => {
                const technologyInfo = TECHNOLOGIES[technologyName];
                const isWideLogo = Object.prototype.hasOwnProperty.call(
                    technologyInfo,
                    'wideLogo',
                );

                return (
                    <a
                        href={technologyInfo.url}
                        key={technologyName}
                        rel="noopener noreferrer"
                        target="_blank"
                        title={technologyInfo.fullName}
                    >
                        <img
                            alt={`${technologyName} logo`}
                            className={`${styles.logo} ${isWideLogo ? styles.wideLogo : ''}`}
                            src={`/media/logos/${technologyName}_logo.webp`}
                        />
                    </a>
                );
            })}
        </div>
    );
};

export default PortfolioTechnologies;
