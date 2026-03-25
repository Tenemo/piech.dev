import 'dotenv/config';

import type { Config } from '@react-router/dev/config';

import {
    CONTACT_PATH,
    getProjectPath,
    HOME_PATH,
    PROJECTS_PATH,
} from './src/app/routePaths';
import { PROJECTS_DATA } from './src/features/Projects/projectsData';
import { fetchGithubData } from './src/utils/fetchGithubData';

export default {
    appDirectory: 'src',
    buildDirectory: 'dist',
    ssr: true,
    async prerender() {
        await fetchGithubData({ refetch: false });
        const staticPaths = [HOME_PATH, PROJECTS_PATH, CONTACT_PATH];
        const itemPaths = PROJECTS_DATA.map((project) =>
            getProjectPath(
                ('repoName' in project ? project.repoName : undefined) ??
                    project.project,
            ),
        );
        return [...staticPaths, ...itemPaths];
    },
} satisfies Config;
