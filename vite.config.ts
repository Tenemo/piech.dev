import { readFileSync } from 'node:fs';
import path from 'node:path';

import { reactRouter } from '@react-router/dev/vite';
import browserslistToEsbuild from 'browserslist-to-esbuild';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig, loadEnv } from 'vite';
import { patchCssModules } from 'vite-css-modules';

import { suppressChromeDevtoolsProbePlugin } from './src/utils/vite/suppressChromeDevtoolsProbePlugin';

type TsconfigShape = {
    compilerOptions?: {
        paths?: Record<string, readonly string[]>;
    };
};

const readTsconfigAliasEntries = (): Record<string, string> => {
    const tsconfig = JSON.parse(
        readFileSync(path.resolve('./tsconfig.json'), 'utf8'),
    ) as TsconfigShape;
    const tsconfigPaths = tsconfig.compilerOptions?.paths ?? {};

    return Object.fromEntries(
        Object.entries(tsconfigPaths)
            .filter(([_aliasPattern, targetPatterns]) => {
                const firstTarget = targetPatterns[0];

                return typeof firstTarget === 'string' && firstTarget !== '';
            })
            .map(([aliasPattern, targetPatterns]) => {
                const firstTarget = targetPatterns[0];
                const alias = aliasPattern.replace(/\/\*$/, '');
                const target = firstTarget
                    .replace(/\/\*$/, '')
                    .replace(/^\.\//, '');

                return [alias, path.resolve(target)];
            }),
    );
};

const absolutePathAliases = readTsconfigAliasEntries();

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
            alias: absolutePathAliases,
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
