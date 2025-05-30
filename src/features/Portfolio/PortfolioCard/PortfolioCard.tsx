import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';

import { usePortfolio, RepositoryInfo } from '../PortfolioContext';
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
    const { getRepositoryInfo, setRepositoryInfo } = usePortfolio();
    const [repositoryInfo, setLocalRepositoryInfo] =
        useState<RepositoryInfo | null>(null);

    const isVideo = /\.(mp4|webm|ogg)$/i.test(projectPreview.toLowerCase());

    useEffect(() => {
        const cachedInfo = getRepositoryInfo(githubRepository);

        if (cachedInfo) {
            setLocalRepositoryInfo(cachedInfo);
            setIsLoading(false);
            return;
        }

        const fetchRepositoryInfo = async (): Promise<void> => {
            try {
                setIsLoading(true);
                setError(null);

                const repositoryResponse = await fetch(
                    `https://api.github.com/repos/${OWNER}/${githubRepository}`,
                );

                if (!repositoryResponse.ok) {
                    throw new Error(
                        `Failed to fetch repository info: ${repositoryResponse.statusText}`,
                    );
                }

                const repositoryData = (await repositoryResponse.json()) as {
                    name?: string;
                    description?: string;
                };

                const newRepositoryInfo = {
                    name: repositoryData.name ?? project,
                    description:
                        repositoryData.description ??
                        'No description available',
                };

                setLocalRepositoryInfo(newRepositoryInfo);
                setRepositoryInfo(githubRepository, newRepositoryInfo);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : 'An unknown error occurred',
                );
                console.error('Error fetching repository info:', err);
            } finally {
                setIsLoading(false);
            }
        };

        void fetchRepositoryInfo();
    }, [githubRepository, setRepositoryInfo, getRepositoryInfo, project]);

    const renderPreview = (): React.ReactNode => {
        const previewContent = isVideo ? (
            <video autoPlay className={styles.image} loop muted playsInline>
                <source
                    src={`/images/projects/${projectPreview}`}
                    type={`video/${projectPreview.split('.').pop() ?? ''}`}
                />
                Your browser does not support the video tag.
            </video>
        ) : (
            <img
                alt={`${project} preview`}
                className={styles.image}
                src={`/images/projects/${projectPreview}`}
            />
        );

        return (
            <Link to={`/portfolio/${githubRepository}`}>{previewContent}</Link>
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
                    <p className={styles.errorMessage}>{error}</p>
                </div>
            );
        }

        return (
            <p>{repositoryInfo?.description ?? 'No description available'}</p>
        );
    };

    return (
        <div
            className={`${styles.card} ${imageOnRight ? styles.imageRight : styles.imageLeft}`}
        >
            <div className={styles.previewContainer}>{renderPreview()}</div>
            <div className={styles.content}>
                <Link
                    className={styles.description}
                    to={`/portfolio/${githubRepository}`}
                >
                    <h3 className={styles.projectTitle}>
                        {project}
                        <OpenInNewIcon fontSize="small" />
                    </h3>
                    {renderContent()}
                </Link>
                <PortfolioTechnologies technologies={technologies} />
            </div>
        </div>
    );
};

export default PortfolioCard;
