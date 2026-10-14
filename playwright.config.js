import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: 'test/e2e',
  use: { baseURL: 'http://localhost:4173' },
  webServer: { command: 'npx http-server -p 4173 -c-1 .', port: 4173, reuseExistingServer: true },
});
