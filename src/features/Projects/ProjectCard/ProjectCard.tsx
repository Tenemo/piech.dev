import { format } from 'date-fns';
import React from 'react';
import { Link } from 'react-router';

import type { ProjectPreviewAsset } from '../projectsData';
import type { TechnologyName } from '../technologies';

import styles from './projectCard.module.scss';
import ProjectTechnologies from './ProjectTechnologies/ProjectTechnologies';

import {
    PROJECT_DATE_FORMAT,
    SILENT_CAPTIONS_TRACK_PATH,
} from 'app/appConstants';
import { getProjectPath } from 'app/routePaths';
import { OpenInNewIcon } from 'components/Icons';
import { repositoriesData } from 'utils/data/githubData';

type ProjectCardProps = {
    name: string;
    repo: string;
    projectPreview: ProjectPreviewAsset;
    imageOnRight?: boolean;
    prioritizePreview?: boolean;
    technologies: readonly TechnologyName[];
};

const ProjectCard = ({
    name,
    repo,
    projectPreview,
    imageOnRight = false,
    prioritizePreview = false,
    technologies,
}: ProjectCardProps): React.JSX.Element => {
    const projectPath = getProjectPath(repo);
    const repositoryInfo = repositoriesData[repo];
    const createdIso = repositoryInfo?.createdDatetime;
    const createdLabel = createdIso
        ? format(new Date(createdIso), PROJECT_DATE_FORMAT)
        : undefined;

    const previewSrc = `/media/projects/${projectPreview.fileName}`;
    const previewFileExtension =
        projectPreview.fileName.split('.').pop()?.toLowerCase() ?? '';
    const isVideo = /\.(mp4|webm|ogg)$/i.test(projectPreview.fileName);

    const renderPreview = (): React.ReactNode => {
        const previewContent = isVideo ? (
            <video
                autoPlay
                className={styles.image}
                height={projectPreview.height}
                loop
                muted
                playsInline
                preload="metadata"
                width={projectPreview.width}
            >
                <source
                    src={previewSrc}
                    type={`video/${previewFileExtension}`}
                />
                <track
                    kind="captions"
                    label="No spoken audio"
                    src={SILENT_CAPTIONS_TRACK_PATH}
                    srcLang="en"
                />
                Your browser does not support the video tag.
            </video>
        ) : (
            <img
                alt={`${name} preview`}
                className={styles.image}
                decoding={prioritizePreview ? undefined : 'async'}
                fetchPriority={prioritizePreview ? 'high' : undefined}
                height={projectPreview.height}
                loading={prioritizePreview ? undefined : 'lazy'}
                src={previewSrc}
                width={projectPreview.width}
            />
        );

        return (
            <Link
                aria-label={`View ${name} project details`}
                className={styles.previewLink}
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
                        {name}
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
