import type { Config } from '@react-router/dev/config';

import { PROJECTS } from './src/features/Portfolio/projects';

export default {
    appDirectory: 'src',
    buildDirectory: 'dist',
    ssr: false,
    // eslint-disable-next-line @typescript-eslint/require-await
    async prerender() {
        const staticPaths = [
            '/',
            '/portfolio',
            '/contact',
            '/linkedin',
            '/github',
            '/telegram',
            '/discord',
        ];
        const itemPaths = PROJECTS.map(
            (p) => `/portfolio/${p.repoName ?? p.project}`,
        );
        return [...staticPaths, ...itemPaths];
    },
} satisfies Config;
