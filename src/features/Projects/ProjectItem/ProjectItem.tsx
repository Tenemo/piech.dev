import ArrowBack from '@mui/icons-material/ArrowBack';
import GitHub from '@mui/icons-material/GitHub';
import React from 'react';
import { Link, useParams } from 'react-router';

import styles from './projectItem.module.scss';
import ProjectMarkdown from './ProjectMarkdown/ProjectMarkdown';

import { README_CONTENT } from 'utils/githubDatazzz';

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

    const markdown = README_CONTENT[repo] ?? '';

    return (
        <main className={styles.container}>
            <title>{`${repo} | piech.dev`}</title>
            <div className={styles.topBar}>
                <Link to="/projects">
                    <ArrowBack /> Back to Projects
                </Link>
                <a
                    className={styles.githubLink}
                    href={`https://github.com/tenemo/${repo}`}
                    rel="noopener noreferrer"
                    target="_blank"
                    title={`View ${repo} on GitHub`}
                >
                    <GitHub /> github.com/tenemo/{repo}
                </a>
            </div>
            <ProjectMarkdown markdown={markdown} repo={repo} />
        </main>
    );
};

export default ProjectItemDetails;
