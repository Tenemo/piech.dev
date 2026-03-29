import { readdirSync } from 'fs';
import path from 'path';

import { reactRouter } from '@react-router/dev/vite';
import browserslistToEsbuild from 'browserslist-to-esbuild';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig, loadEnv } from 'vite';
import { patchCssModules } from 'vite-css-modules';

import { suppressChromeDevtoolsProbePlugin } from './src/utils/vite/suppressChromeDevtoolsProbePlugin';

// Automatically pick up all directories in the src/ directory and add them as aliases later
const absolutePathAliases: Record<string, string> = {};
const srcPath = path.resolve('./src/');
const srcRootContent = readdirSync(srcPath, { withFileTypes: true }).map(
    (direct) => direct.name.replace(/(\.ts){1}(x?)/, ''),
);
srcRootContent.forEach((directory) => {
    absolutePathAliases[directory] = path.join(srcPath, directory);
});
const workspacePathAliases: Record<string, string> = {
    e2e: path.resolve('./e2e/'),
    netlify: path.resolve('./netlify/'),
    temp: path.resolve('./temp/'),
};

const manualChunks = (id: string): string | null => {
    if (id.includes('node_modules')) {
        return 'vendor';
    }

    return null;
};

export default defineConfig(({ mode, command }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const analyze = env.ANALYZE === 'true';
    return {
        base: '/',
        plugins: [
            suppressChromeDevtoolsProbePlugin(),
            reactRouter(),
            patchCssModules({
                generateSourceTypes: true,
            }),
            analyze &&
                visualizer({
                    open: true,
                    filename: 'dist/stats.html',
                }),
        ],
        ssr: command === 'build' ? { noExternal: true } : {},
        css: {
            devSourcemap: true,
            preprocessorOptions: {
                scss: {},
            },
            cssMinify: 'lightningcss',
            modules: {
                localsConvention: 'camelCase',
                generateScopedName:
                    mode === 'development' ? '[path]_[local]' : '[hash:base64]',
            },
        },
        resolve: {
            tsconfigPaths: true,
            alias: {
                ...absolutePathAliases,
                ...workspacePathAliases,
            },
        },
        server: {
            port: 3000,
            strictPort: true,
            open: false,
        },
        build: {
            sourcemap: false,
            outDir: 'dist',
            cssCodeSplit: true,
            chunkSizeWarningLimit: 2_000,

            target: browserslistToEsbuild(),
            rollupOptions: {
                output: {
                    manualChunks,
                },
            },
        },
    };
});
