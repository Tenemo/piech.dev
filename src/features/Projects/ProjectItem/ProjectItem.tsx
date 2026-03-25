import React from 'react';
import { Link, useParams } from 'react-router';

import styles from './projectItem.module.scss';
import ProjectMarkdown from './ProjectMarkdown/ProjectMarkdown';

import { PROJECTS_PATH } from 'app/routePaths';
import { SITE_LINKS } from 'app/siteLinks';
import { ArrowBackIcon, GitHubIcon } from 'components/Icons';
import { repositoriesData } from 'utils/data/githubData';

const ProjectItemDetails: React.FC = (): React.JSX.Element => {
    const { repo } = useParams<{ repo: string }>();
    if (!repo) {
        return (
            <div className={styles.error}>
                <h3>Error loading repository</h3>
                <p>Repository information is missing</p>
            </div>
        );
    }

    const markdown = repositoriesData[repo]?.readme_content ?? '';
    const repositoryUrl = `${SITE_LINKS.githubProfile}/${repo}`;

    return (
        <main className={styles.container}>
            <div className={styles.topBar}>
                <Link to={PROJECTS_PATH}>
                    <ArrowBackIcon /> Back to Projects
                </Link>
                <a
                    className={styles.githubLink}
                    href={repositoryUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                    title={`View ${repo} on GitHub`}
                >
                    <GitHubIcon /> github.com/tenemo/{repo}
                </a>
            </div>
            <ProjectMarkdown markdown={markdown} repo={repo} />
        </main>
    );
};

export default ProjectItemDetails;
