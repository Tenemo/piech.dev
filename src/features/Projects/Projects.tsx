import { Helmet } from '@dr.pogodin/react-helmet';
import React from 'react';

import ProjectCard from './ProjectCard/ProjectCard';
import styles from './projects.module.scss';
import { PROJECTS } from './projectsList';

const Project = (): React.JSX.Element => {
    return (
        <main className={styles.projects}>
            <Helmet>
                <title>Projects | piech.dev</title>
                <meta
                    content="Non-commercial projects I built in my free time: small tools, libraries, and experiments in React, TypeScript, cryptography, and more."
                    name="description"
                />
                <meta content="Projects | piech.dev" property="og:title" />
                <meta
                    content="Non-commercial projects I built in my free time: small tools, libraries, and experiments in React, TypeScript, cryptography, and more."
                    property="og:description"
                />
                <link href="https://piech.dev/projects/" rel="canonical" />
            </Helmet>
            <h2>Projects</h2>
            <div className={'divider'} />
            <p className={'smallHeadline'}>
                Non-commercial projects I built in my free time.
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
