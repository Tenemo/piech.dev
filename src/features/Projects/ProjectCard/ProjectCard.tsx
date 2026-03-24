import { format } from 'date-fns';
import React from 'react';
import { Link } from 'react-router';

import { getProjectRepo, getProjectRoutePath } from '../projectUtils';
import { TECHNOLOGIES } from '../technologies';

import styles from './projectCard.module.scss';
import ProjectTechnologies from './ProjectTechnologies/ProjectTechnologies';

import { OpenInNewIcon } from 'components/Icons';
import { repositoriesData } from 'utils/githubData';

type ProjectCardProps = {
    projectPreview: string;
    imageOnRight?: boolean;
    technologies: readonly (keyof typeof TECHNOLOGIES)[];
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
    const githubRepository = getProjectRepo({ project, repoName });
    const projectPath = getProjectRoutePath({ project, repoName });
    const repositoryInfo = repositoriesData[githubRepository];
    const createdIso = repositoryInfo?.createdDatetime;
    const createdLabel = createdIso
        ? format(new Date(createdIso), 'MMMM yyyy')
        : undefined;

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
            <Link
                aria-label={`View ${project} project details`}
                to={projectPath}
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
                <Link className={styles.description} to={projectPath}>
                    {createdLabel && (
                        <time
                            aria-label={`Project kickoff month: ${createdLabel}`}
                            className={styles.dateBadge}
                            dateTime={createdIso}
                            title="Date the project was kicked off"
                        >
                            {createdLabel}
                        </time>
                    )}
                    <h3 className={styles.projectTitle}>
                        {project}
                        <OpenInNewIcon />
                    </h3>
                    {renderContent()}
                </Link>
                <ProjectTechnologies technologies={technologies} />
            </div>
        </div>
    );
};

export default ProjectCard;
