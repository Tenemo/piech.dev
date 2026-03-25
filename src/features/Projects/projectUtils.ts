import { PROJECTS } from './projectsData';

import { getProjectPath } from 'app/routePaths';

export const getProjectRoutePath = (repo: string): string =>
    getProjectPath(repo);

export const findProjectByRepo = (
    repo: string,
): (typeof PROJECTS)[number] | undefined =>
    PROJECTS.find((project) => project.repo === repo);
