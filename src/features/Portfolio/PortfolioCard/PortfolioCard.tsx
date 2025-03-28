import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';

import { TECHNOLOGIES } from '../technologies';

import styles from './portfolioCard.module.scss';

type PortfolioCardProps = {
    imageUrl: string;
    imageOnRight?: boolean;
    technologies: string[];
    project: string;
};

type PackageInfo = {
    name: string;
    description: string;
};

const OWNER = 'tenemo';
const BRANCH = 'master';

const PortfolioCard = ({
    imageUrl,
    imageOnRight = false,
    technologies,
    project,
}: PortfolioCardProps): React.JSX.Element => {
    const [packageInfo, setPackageInfo] = useState<PackageInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPackageInfo = async (): Promise<void> => {
            try {
                setIsLoading(true);
                setError(null);

                const packageJsonResponse = await fetch(
                    `https://raw.githubusercontent.com/${OWNER}/${project}/${BRANCH}/package.json`,
                );

                if (!packageJsonResponse.ok) {
                    throw new Error(
                        `Failed to fetch package.json: ${packageJsonResponse.statusText}`,
                    );
                }

                const packageJsonData = (await packageJsonResponse.json()) as
                    | PackageInfo
                    | undefined;
                setPackageInfo({
                    name: packageJsonData?.name ?? project,
                    description:
                        packageJsonData?.description ??
                        'No description available',
                });
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : 'An unknown error occurred',
                );
                console.error('Error fetching package info:', err);
            } finally {
                setIsLoading(false);
            }
        };

        void fetchPackageInfo();
    }, [project]);

    const renderContent = (): React.ReactNode => {
        if (isLoading) {
            return (
                <div className={styles.loadingContainer}>
                    <p>Loading project information...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className={styles.errorContainer}>
                    <h3>{project}</h3>
                    <p className={styles.errorMessage}>{error}</p>
                </div>
            );
        }

        return (
            <>
                <h3>{packageInfo?.name ?? project}</h3>
                <p>{packageInfo?.description ?? 'No description available'}</p>
            </>
        );
    };

    return (
        <div
            className={`${styles.card} ${imageOnRight ? styles.imageRight : styles.imageLeft}`}
        >
            <>
                <div className={styles.imageContainer}>
                    <img
                        alt={`${project} preview`}
                        className={styles.image}
                        src={imageUrl}
                    />
                </div>
                <div className={styles.content}>
                    <Link to={`/portfolio/${project}`}>{renderContent()}</Link>

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
            </>
        </div>
    );
};

export default PortfolioCard;
