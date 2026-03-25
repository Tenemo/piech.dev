import type { Plugin } from 'vite';

import { CONTACT_PATH, getProjectPath, PROJECTS_PATH } from '../app/routePaths';
import { PROJECTS_DATA } from '../features/Projects/projectsData';

const trailingSlashRedirects = new Map(
    [
        PROJECTS_PATH,
        CONTACT_PATH,
        ...PROJECTS_DATA.map((project) =>
            getProjectPath(
                ('repoName' in project ? project.repoName : undefined) ??
                    project.project,
            ),
        ),
    ].map((pathname) => [pathname.replace(/\/$/, ''), pathname]),
);

export const trailingSlashRedirectsPlugin = (): Plugin => ({
    name: 'trailing-slash-redirects',
    configureServer(server) {
        server.middlewares.use((request, response, next) => {
            if (!request.url) {
                next();
                return;
            }

            const url = new URL(request.url, 'http://localhost');
            const redirectTarget = trailingSlashRedirects.get(url.pathname);

            if (
                redirectTarget &&
                (request.method === 'GET' || request.method === 'HEAD')
            ) {
                response.statusCode = 307;
                response.setHeader(
                    'Location',
                    `${redirectTarget}${url.search}`,
                );
                response.end();
                return;
            }

            next();
        });
    },
});
