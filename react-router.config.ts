import 'dotenv/config';

import type { Config } from '@react-router/dev/config';

import {
    CONTACT_PATH,
    getProjectPath,
    HOME_PATH,
    PROJECTS_PATH,
} from './src/app/routePaths';
import { PROJECTS } from './src/features/Projects/projectsData';
import { fetchGithubData } from './src/utils/build/fetchGithubData';

export default {
    appDirectory: 'src',
    buildDirectory: 'dist',
    ssr: true,
    async prerender() {
        await fetchGithubData({ refetch: false });
        const staticPaths = [HOME_PATH, PROJECTS_PATH, CONTACT_PATH];
        const itemPaths = PROJECTS.map((project) =>
            getProjectPath(project.repo),
        );
        return [...staticPaths, ...itemPaths];
    },
} satisfies Config;
