import { PROJECTS } from './projectsData';

export const findProjectByRepo = (
    repo: string,
): (typeof PROJECTS)[number] | undefined =>
    PROJECTS.find((project) => project.repo === repo);
