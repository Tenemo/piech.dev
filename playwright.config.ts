import {
    defineConfig,
    devices,
    type ReporterDescription,
} from '@playwright/test';

const reporters: ReporterDescription[] = process.env.CI
    ? [
          ['dot'],
          ['github'],
          ['html', { open: 'never', outputFolder: 'playwright-report' }],
      ]
    : [
          ['list'],
          ['html', { open: 'never', outputFolder: 'playwright-report' }],
      ];

export default defineConfig({
    testDir: './e2e',
    outputDir: 'test-results',
    forbidOnly: Boolean(process.env.CI),
    retries: process.env.CI ? 1 : 0,
    reporter: reporters,
    use: {
        baseURL: 'http://127.0.0.1:4173',
        screenshot: 'only-on-failure',
        trace: 'retain-on-failure',
        video: 'retain-on-failure',
    },
    projects: [
        {
            name: 'Desktop Chrome',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'Desktop Firefox',
            use: { ...devices['Desktop Firefox'] },
        },
        {
            name: 'Desktop Safari',
            use: { ...devices['Desktop Safari'] },
        },
    ],
    webServer: {
        command: 'npm run serve:e2e',
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
        url: 'http://127.0.0.1:4173',
    },
});
