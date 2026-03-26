import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
    resolve: {
        tsconfigPaths: true,
    },
    test: {
        exclude: [...configDefaults.exclude, 'e2e/**'],
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/utils/testing/testsSetup.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            exclude: [
                'temp/*',
                '**/*.d.ts',
                'eslint.config.js',
                'postcss.config.js',
                'vite.config.ts',
                'vitest.config.ts',
                'dist/*',
                'src/main.tsx',
            ],
        },
    },
});
