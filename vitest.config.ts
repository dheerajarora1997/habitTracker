import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    env: {
      MONGODB_URI: 'mongodb://localhost:27017/test-habit-tracker',
      JWT_SECRET: 'mock-test-jwt-secret-key-for-habit-partner',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
