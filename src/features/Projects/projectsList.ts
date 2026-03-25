import { PROJECTS_DATA } from './projectsData';
import { TECHNOLOGIES } from './technologies';

type TechnologyName = keyof typeof TECHNOLOGIES;

export type ProjectEntry = {
    projectPreview: string;
    project: string;
    repoName?: string;
    ogImage: string;
    ogImageAlt: string;
    technologies: readonly TechnologyName[];
};

export const PROJECTS: readonly ProjectEntry[] = PROJECTS_DATA;
