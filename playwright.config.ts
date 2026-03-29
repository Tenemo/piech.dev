import {
    defineConfig,
    devices,
    type ReporterDescription,
} from '@playwright/test';

import {
    E2E_BASE_URL,
    E2E_PORT,
    SHOULD_USE_REMOTE_E2E,
} from './e2e/support/e2eConfig';

const SHOULD_USE_BLOB_REPORTER = process.env.PLAYWRIGHT_BLOB_REPORT === 'true';
const reporters: ReporterDescription[] = SHOULD_USE_BLOB_REPORTER
    ? [['dot'], ['blob', { outputDir: 'blob-report' }]]
    : process.env.CI
      ? [
            ['dot'],
            ['github'],
            ['html', { open: 'never', outputFolder: 'playwright-report' }],
        ]
      : [
            ['list'],
            ['html', { open: 'never', outputFolder: 'playwright-report' }],
        ];
const galaxyS24 = devices['Galaxy S24'];
const { defaultBrowserType: _defaultBrowserType, ...galaxyS24Device } =
    galaxyS24;

export default defineConfig({
    testDir: './e2e',
    outputDir: 'test-results',
    fullyParallel: Boolean(process.env.CI) && !SHOULD_USE_REMOTE_E2E,
    forbidOnly: Boolean(process.env.CI),
    retries: process.env.CI ? 1 : 0,
    workers: SHOULD_USE_REMOTE_E2E ? 1 : process.env.CI ? 4 : undefined,
    reporter: reporters,
    use: {
        baseURL: E2E_BASE_URL,
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
        {
            name: 'Mobile Chrome (Galaxy S24)',
            use: { ...devices['Galaxy S24'] },
        },
        {
            name: 'Mobile Safari (iPhone 15)',
            use: { ...devices['iPhone 15'] },
        },
        {
            name: 'Mobile Firefox (Galaxy S24)',
            use: {
                ...galaxyS24Device,
                browserName: 'firefox',
                // Playwright documents `isMobile` as unsupported in Firefox.
                isMobile: false,
                userAgent:
                    'Mozilla/5.0 (Android 14; Mobile; rv:147.0) Gecko/147.0 Firefox/147.0',
            },
        },
    ],
    webServer: SHOULD_USE_REMOTE_E2E
        ? undefined
        : {
              command: 'npm run serve:e2e',
              env: {
                  ...process.env,
                  PORT: String(E2E_PORT),
              },
              reuseExistingServer: !process.env.CI,
              timeout: 120 * 1000,
              url: E2E_BASE_URL,
          },
});
