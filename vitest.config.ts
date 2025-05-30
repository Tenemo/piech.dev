import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    plugins: [react(), tsconfigPaths()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/utils/testsSetup.ts'],
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
