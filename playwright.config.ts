import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const isContainer = !!process.env.PLAYWRIGHT_CONTAINER;
const port = process.env.PORT ?? '4200';
const localAddress = process.env.LOCAL_ADDRESS ?? 'localhost';
const isCI = !!process.env.CI;
const webServerCommand = 'yarn start:prod';

let isA11y =
  !!process.env.PLAYWRIGHT_isa11y && process.env.PLAYWRIGHT_isa11y.toLocaleLowerCase() !== 'false';
let isVrt =
  !!process.env.PLAYWRIGHT_isvrt && process.env.PLAYWRIGHT_isvrt.toLocaleLowerCase() !== 'false';
// Per default do both A11y and VRT
if (!isA11y && !isVrt) {
  isA11y = true;
  isVrt = true;
}

const baseViewport = {
  width: 1000,
  height: 660
};

const chromeLaunchOptions = {
  args: [
    '--disable-skia-runtime-opts',
    '--force-color-profile=srgb',
    '--disable-low-res-tiling',
    '--disable-oop-rasterization',
    '--disable-composited-antialiasing',
    '--disable-smooth-scrolling'
  ]
};

export default defineConfig({
  testDir: './playwright',
  snapshotDir: './playwright/snapshots',
  /* Maximum time one test can run for. */
  timeout: 30 * 1000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 5000,
    toHaveScreenshot: { maxDiffPixels: 0, threshold: 0.075 }
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  workers: 4,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: isCI
    ? [
        [
          'html',
          {
            open: 'on-failure',
            outputFolder: './playwright/results/preview'
          }
        ],
        [
          'junit',
          {
            outputFile: `./playwright/results/reports/report-e2e.xml`,
            includeProjectInTestName: true
          }
        ],
        [
          './playwright/reporters/playwright-axe-reporter.ts',
          {
            outputFile: './playwright/results/a11y/accessibility-report.json',
            htmlOutputDir: './playwright/results/a11y/tests'
          }
        ]
      ]
    : [
        ['line'],
        [
          'html',
          {
            open: isContainer ? 'never' : 'on-failure',
            outputFolder: './playwright/results/preview'
          }
        ],
        [
          'junit',
          {
            outputFile: `./playwright/results/reports/report-${
              isA11y && isVrt ? 'e2e' : isA11y ? 'a11y' : 'vrt'
            }.xml`,
            includeProjectInTestName: true
          }
        ],
        [
          './playwright/reporters/playwright-axe-reporter.ts',
          {
            outputFile: './playwright/results/a11y/accessibility-report.json',
            htmlOutputDir: './playwright/results/a11y/tests',
            isA11y
          }
        ]
      ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL: `http://${localAddress}:${port}`,
    launchOptions: chromeLaunchOptions,
    viewport: baseViewport,
    actionTimeout: 0,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry'
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: webServerCommand,
    url: `http://${localAddress}:${port}`,
    reuseExistingServer: !isCI
  }
});