import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import React from 'react';
import { Link } from 'react-router';

import { REPOSITORY_INFO } from '../generated/githubData';
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

const PortfolioCard = ({
    projectPreview,
    imageOnRight = false,
    technologies,
    project,
    repoName,
}: PortfolioCardProps): React.JSX.Element => {
    const githubRepository = repoName ?? project;
    const repositoryInfo = REPOSITORY_INFO[githubRepository];

    const isVideo = /\.(mp4|webm|ogg)$/i.test(projectPreview.toLowerCase());

    const renderPreview = (): React.ReactNode => {
        const previewContent = isVideo ? (
            <video autoPlay className={styles.image} loop muted playsInline>
                <source
                    src={`/media/projects/${projectPreview}`}
                    type={`video/${projectPreview.split('.').pop() ?? ''}`}
                />
                Your browser does not support the video tag.
            </video>
        ) : (
            <img
                alt={`${project} preview`}
                className={styles.image}
                src={`/media/projects/${projectPreview}`}
            />
        );

        return (
            <Link to={`/portfolio/${githubRepository}`}>{previewContent}</Link>
        );
    };

    const renderContent = (): React.ReactNode => {
        const description =
            repositoryInfo?.description ?? 'No description available';
        return <p>{description}</p>;
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
