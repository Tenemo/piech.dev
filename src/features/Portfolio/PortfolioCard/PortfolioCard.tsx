import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';

import { usePortfolio, PackageInfo } from '../PortfolioContext';
import { TECHNOLOGIES } from '../technologies';

import styles from './portfolioCard.module.scss';
import PortfolioTechnologies from './PortfolioTechnologies/PortfolioTechnologies';

type PortfolioCardProps = {
    projectPreview: string;
    imageOnRight?: boolean;
    technologies: (keyof typeof TECHNOLOGIES)[];
    project: string;
    repoName?: string;
};

const OWNER = 'tenemo';
const BRANCH = 'master';

const PortfolioCard = ({
    projectPreview,
    imageOnRight = false,
    technologies,
    project,
    repoName,
}: PortfolioCardProps): React.JSX.Element => {
    const githubRepository = repoName ?? project;
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { getPackageInfo, setPackageInfo } = usePortfolio();
    const [packageInfo, setLocalPackageInfo] = useState<PackageInfo | null>(
        null,
    );

    const isVideo = /\.(mp4|webm|ogg)$/i.test(projectPreview);

    useEffect(() => {
        const cachedInfo = getPackageInfo(githubRepository);

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
                    `https://raw.githubusercontent.com/${OWNER}/${githubRepository}/${BRANCH}/package.json`,
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

                setLocalPackageInfo(newPackageInfo);
                setPackageInfo(githubRepository, newPackageInfo);
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
    }, [githubRepository, setPackageInfo, getPackageInfo, project]);

    const renderPreview = (): React.ReactNode => {
        if (isVideo) {
            return (
                <video autoPlay className={styles.image} loop muted playsInline>
                    <source
                        src={`/images/projects/${projectPreview}`}
                        type={`video/${projectPreview.split('.').pop() ?? ''}`}
                    />
                    Your browser does not support the video tag.
                </video>
            );
        }

        return (
            <img
                alt={`${project} preview`}
                className={styles.image}
                src={`/images/projects/${projectPreview}`}
            />
        );
    };

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
                    <Link to={`/portfolio/${githubRepository}`}>
                        {renderPreview()}
                    </Link>
                </div>
                <div className={styles.content}>
                    <Link
                        className={styles.description}
                        to={`/portfolio/${githubRepository}`}
                    >
                        {renderContent()}
                    </Link>
                    <PortfolioTechnologies technologies={technologies} />
                </div>
            </>
        </div>
    );
};

export default PortfolioCard;
