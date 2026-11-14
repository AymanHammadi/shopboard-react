import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: true,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:5197',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'mobile',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 360, height: 800 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: [
    {
      command: 'node e2e/fixtures-server.ts',
      url: 'http://127.0.0.1:5198/products',
      reuseExistingServer: false,
    },
    {
      command:
        process.env.SHOPBOARD_E2E_PRODUCTION === '1'
          ? 'npm run start -- --hostname 127.0.0.1 --port 5197'
          : 'npm run dev -- --hostname 127.0.0.1 --port 5197',
      url: 'http://127.0.0.1:5197',
      reuseExistingServer: false,
      env: { API_BASE_URL: 'http://127.0.0.1:5198' },
    },
  ],
});
