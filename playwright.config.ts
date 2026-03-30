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
const INVARIANT_SPEC_GLOBS = [
    '**/asset-health.spec.ts',
    '**/route-health.spec.ts',
    '**/seo.spec.ts',
    '**/sitemap.spec.ts',
    '**/zero-js.spec.ts',
];
const KEYBOARD_ACCESSIBILITY_SPEC_GLOB = '**/accessibility-keyboard.spec.ts';
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

function parseWorkerCount(
    envVarName: string,
    rawValue: string | undefined,
    fallback: number | undefined,
): number | undefined {
    if (rawValue === undefined || rawValue === '') {
        return fallback;
    }

    const parsedValue = Number(rawValue);

    if (
        !Number.isFinite(parsedValue) ||
        !Number.isInteger(parsedValue) ||
        parsedValue < 1
    ) {
        throw new Error(
            `Invalid ${envVarName} value "${rawValue}". Expected a positive integer.`,
        );
    }

    return parsedValue;
}

const ciWorkerCount = parseWorkerCount(
    'PLAYWRIGHT_CI_WORKERS',
    process.env.PLAYWRIGHT_CI_WORKERS,
    4,
);
const localWorkerCount = parseWorkerCount(
    'PLAYWRIGHT_LOCAL_WORKERS',
    process.env.PLAYWRIGHT_LOCAL_WORKERS,
    4,
);
const remoteCiWorkerCount = parseWorkerCount(
    'PLAYWRIGHT_REMOTE_CI_WORKERS',
    process.env.PLAYWRIGHT_REMOTE_CI_WORKERS,
    1,
);

export default defineConfig({
    testDir: './e2e',
    outputDir: 'test-results',
    fullyParallel: Boolean(process.env.CI) && !SHOULD_USE_REMOTE_E2E,
    forbidOnly: Boolean(process.env.CI),
    retries: process.env.CI ? 1 : 0,
    workers: SHOULD_USE_REMOTE_E2E
        ? process.env.CI
            ? remoteCiWorkerCount
            : 1
        : process.env.CI
          ? ciWorkerCount
          : localWorkerCount,
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
            testIgnore: INVARIANT_SPEC_GLOBS,
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'Desktop Chrome Invariant',
            testMatch: INVARIANT_SPEC_GLOBS,
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'Desktop Firefox',
            testIgnore: INVARIANT_SPEC_GLOBS,
            use: { ...devices['Desktop Firefox'] },
        },
        {
            name: 'Desktop Safari',
            testIgnore: [
                ...INVARIANT_SPEC_GLOBS,
                KEYBOARD_ACCESSIBILITY_SPEC_GLOB,
            ],
            use: { ...devices['Desktop Safari'] },
        },
        {
            name: 'Mobile Chrome (Galaxy S24)',
            testIgnore: [
                ...INVARIANT_SPEC_GLOBS,
                KEYBOARD_ACCESSIBILITY_SPEC_GLOB,
            ],
            use: { ...devices['Galaxy S24'] },
        },
        {
            name: 'Mobile Safari (iPhone 15)',
            testIgnore: [
                ...INVARIANT_SPEC_GLOBS,
                KEYBOARD_ACCESSIBILITY_SPEC_GLOB,
            ],
            use: { ...devices['iPhone 15'] },
        },
        {
            name: 'Mobile Firefox (Galaxy S24)',
            testIgnore: [
                ...INVARIANT_SPEC_GLOBS,
                KEYBOARD_ACCESSIBILITY_SPEC_GLOB,
            ],
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
