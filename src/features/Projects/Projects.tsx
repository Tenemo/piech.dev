import React from 'react';

import ProjectCard from './ProjectCard/ProjectCard';
import styles from './projects.module.scss';
import { PROJECTS } from './projectsData';

const Project = (): React.JSX.Element => {
    return (
        <main className={styles.projects}>
            <h2>Projects</h2>
            <div className={'divider'} />
            <p className={'smallHeadline'}>Projects I built in my free time.</p>
            <div className={'divider'} />
            <div className={styles.projectsItemsContainer}>
                {PROJECTS.map(
                    ({ name, projectPreview, repo, technologies }, index) => (
                        <React.Fragment key={repo}>
                            <ProjectCard
                                imageOnRight={index % 2 === 1}
                                name={name}
                                prioritizePreview={index === 0}
                                projectPreview={projectPreview}
                                repo={repo}
                                technologies={technologies}
                            />
                            <div className="divider" />
                        </React.Fragment>
                    ),
                )}
            </div>
        </main>
    );
};

export default Project;
