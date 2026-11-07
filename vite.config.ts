import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { apiScenarios } from './tooling/api-scenarios.ts';

export default defineConfig({
  plugins: [react(), apiScenarios()],
  server: {
    proxy: {
      '/api': {
        target: 'https://dummyjson.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    restoreMocks: true,
    clearMocks: true,
  },
});
