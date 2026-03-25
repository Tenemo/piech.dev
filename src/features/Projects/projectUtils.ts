import { PROJECTS } from './projectsList';

import { getProjectPath } from 'app/routePaths';

export const getProjectRepo = ({
    project,
    repoName,
}: {
    project: string;
    repoName?: string;
}): string => repoName ?? project;

export const getProjectRoutePath = ({
    project,
    repoName,
}: {
    project: string;
    repoName?: string;
}): string => getProjectPath(getProjectRepo({ project, repoName }));

export const findProjectByRepo = (
    repo: string,
): (typeof PROJECTS)[number] | undefined =>
    PROJECTS.find((project) => getProjectRepo(project) === repo);
