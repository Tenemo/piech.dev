import type { Plugin } from 'vite';

const CHROME_DEVTOOLS_PROBE_PATH =
    '/.well-known/appspecific/com.chrome.devtools.json';

export const suppressChromeDevtoolsProbePlugin = (): Plugin => ({
    name: 'suppress-chrome-devtools-probe',
    configureServer(server) {
        server.middlewares.use((request, response, next) => {
            if (!request.url) {
                next();
                return;
            }

            let url: URL;
            try {
                url = new URL(request.url, 'http://localhost');
            } catch {
                next();
                return;
            }

            if (url.pathname !== CHROME_DEVTOOLS_PROBE_PATH) {
                next();
                return;
            }

            response.statusCode = 204;
            response.end();
        });
    },
});
