import { OpenInNew as OpenInNewIcon } from '@mui/icons-material';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';

import { usePortfolio, PackageInfo } from '../PortfolioContext';
import { TECHNOLOGIES } from '../technologies';

import styles from './portfolioCard.module.scss';

type PortfolioCardProps = {
    imagePath: string;
    imageOnRight?: boolean;
    technologies: (keyof typeof TECHNOLOGIES)[];
    project: string;
};

const OWNER = 'tenemo';
const BRANCH = 'master';

const PortfolioCard = ({
    imagePath,
    imageOnRight = false,
    technologies,
    project,
}: PortfolioCardProps): React.JSX.Element => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { getPackageInfo, setPackageInfo } = usePortfolio();
    const [packageInfo, setLocalPackageInfo] = useState<PackageInfo | null>(
        null,
    );

    useEffect(() => {
        // Check for cached data immediately
        const cachedInfo = getPackageInfo(project);

        if (cachedInfo) {
            setLocalPackageInfo(cachedInfo);
            setIsLoading(false);
            return;
        }

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

                const newPackageInfo = {
                    name: packageJsonData?.name ?? project,
                    description:
                        packageJsonData?.description ??
                        'No description available',
                };

                // Update both local state and context cache
                setLocalPackageInfo(newPackageInfo);
                setPackageInfo(project, newPackageInfo);
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
    }, [project, setPackageInfo, getPackageInfo]);

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
                <h3>
                    {packageInfo?.name ?? project} <OpenInNewIcon />
                </h3>
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
                    <Link to={`/portfolio/${project}`}>
                        <img
                            alt={`${project} preview`}
                            className={styles.image}
                            src={imagePath}
                        />
                    </Link>
                </div>
                <div className={styles.content}>
                    <Link
                        className={styles.description}
                        to={`/portfolio/${project}`}
                    >
                        {renderContent()}
                    </Link>
                    <div className={styles.technologiesContainer}>
                        {technologies.length > 0 && (
                            <>
                                {technologies.map((technologyName) => {
                                    const technologyInfo =
                                        TECHNOLOGIES[technologyName];
                                    let isWideLogo = false;
                                    if (
                                        Object.prototype.hasOwnProperty.call(
                                            technologyInfo,
                                            'wideLogo',
                                        )
                                    ) {
                                        isWideLogo = true;
                                    }

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
                                                className={`${styles.logo} ${isWideLogo ? styles.wideLogo : ''}`}
                                                src={`src/images/logos/${technologyName}_logo.png`}
                                            />
                                        </a>
                                    );
                                })}
                            </>
                        )}
                    </div>
                </div>
            </>
        </div>
    );
};

export default PortfolioCard;
