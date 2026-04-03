import { defineConfig, devices } from "@playwright/test";

/**
 * E2E Test Configuration for Ozigi
 * 
 * Supports three environments via BASE_URL env var:
 * - Local:   npm run test (uses localhost:3000)
 * - Staging: BASE_URL=https://staging.ozigi.app npm run test
 * - Prod:    BASE_URL=https://ozigi.app npm run test
 */
const baseURL = process.env.BASE_URL || 'http://localhost:3000';
const isLocalDev = baseURL.includes('localhost');

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['list'],
    ...(process.env.CI ? [['github' as const]] : []),
  ],
  
  /* Timeout settings */
  timeout: 60 * 1000, // 60s per test
  expect: {
    timeout: 10 * 1000, // 10s for assertions
  },

  /* Only start dev server when testing locally */
  ...(isLocalDev && {
    webServer: {
      command: 'npm run dev',
      url: 'http://localhost:3000',
      reuseExistingServer: true, // Always reuse if already running
      timeout: 180 * 1000, // 3 minutes for slower machines
      stdout: 'pipe',
      stderr: 'pipe',
    },
  }),

  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },
  ],
});
