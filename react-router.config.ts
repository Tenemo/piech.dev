import 'dotenv/config';

import type { Config } from '@react-router/dev/config';

import { PROJECTS } from './src/features/Projects/projectsList';
import { fetchGitHubData } from './src/utils/fetchGithubData';

export default {
    appDirectory: 'src',
    buildDirectory: 'dist',
    ssr: true,
    async prerender() {
        await fetchGitHubData({ refetch: false });
        const staticPaths = ['/', '/projects', '/contact'];
        const itemPaths = PROJECTS.map(
            (p) => `/projects/${p.repoName ?? p.project}`,
        );
        return [...staticPaths, ...itemPaths];
    },
} satisfies Config;
