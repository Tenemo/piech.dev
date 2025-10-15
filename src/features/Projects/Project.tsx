import { Helmet } from '@dr.pogodin/react-helmet';
import React from 'react';

import styles from './project.module.scss';
import ProjectCard from './ProjectCard/ProjectCard';
import { PROJECTS } from './projects';

const Project = (): React.JSX.Element => {
    return (
        <main className={styles.projects}>
            <Helmet>
                <title>Projects | piech.dev</title>
            </Helmet>
            <h2>Projects</h2>
            <div className={'divider'} />
            <p className={'smallHeadline'}>
                Non-commercial projects I did in my free time.
            </p>
            <div className={'divider'} />

            <div className={styles.projectsItemsContainer}>
                {PROJECTS.map(
                    ({ projectPreview, project, technologies }, index) => (
                        <React.Fragment key={project}>
                            <ProjectCard
                                imageOnRight={index % 2 === 1}
                                project={project}
                                projectPreview={projectPreview}
                                technologies={technologies}
                                {...(PROJECTS[index].repoName
                                    ? {
                                          repoName: PROJECTS[index].repoName,
                                      }
                                    : {})}
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
