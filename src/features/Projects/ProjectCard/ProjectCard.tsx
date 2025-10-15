import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import React from 'react';
import { Link } from 'react-router';

import { TECHNOLOGIES } from '../technologies';

import styles from './projectCard.module.scss';
import ProjectTechnologies from './ProjectTechnologies/ProjectTechnologies';

import { REPOSITORY_INFO } from 'utils/githubData';

type ProjectCardProps = {
    projectPreview: string;
    imageOnRight?: boolean;
    technologies: (keyof typeof TECHNOLOGIES)[];
    project: string;
    repoName?: string;
};

const ProjectCard = ({
    projectPreview,
    imageOnRight = false,
    technologies,
    project,
    repoName,
}: ProjectCardProps): React.JSX.Element => {
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
                fetchPriority="high"
                src={`/media/projects/${projectPreview}`}
            />
        );

        return (
            <Link
                aria-label={`View ${project} project details`}
                to={`/projects/${githubRepository}`}
            >
                {previewContent}
            </Link>
        );
    };

    const renderContent = (): React.ReactNode => {
        const description =
            repositoryInfo?.description ?? 'No description available';
        return <p data-nosnippet>{description}</p>;
    };

    return (
        <div
            className={`${styles.card} ${imageOnRight ? styles.imageRight : styles.imageLeft}`}
        >
            <div className={styles.previewContainer}>{renderPreview()}</div>
            <div className={styles.content}>
                <Link
                    className={styles.description}
                    to={`/projects/${githubRepository}`}
                >
                    <h3 className={styles.projectTitle}>
                        {project}
                        <OpenInNewIcon fontSize="small" />
                    </h3>
                    {renderContent()}
                </Link>
                <ProjectTechnologies technologies={technologies} />
            </div>
        </div>
    );
};

export default ProjectCard;
