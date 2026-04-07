import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

const srcRoot = resolve(__dirname, 'src');
const appRoot = resolve(srcRoot, 'app');

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/setup-tests.ts'],
    include: ['src/**/*.spec.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
    execArgv: ['--max-old-space-size=8192'],
    pool: 'forks',
    forks: {
      singleFork: false,
      maxForks: 1,
    },
    server: {
      deps: {
        inline: [/@angular/, /primeng/, /@primeng/, /@testing-library/],
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      reportOnFailure: true,
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.spec.ts',
        'src/**/*.test.ts',
        'src/**/index.ts',
        'src/main.ts',
        'src/environments/**',
        'src/**/*.module.ts',
        'src/**/*.routes.ts',
      ],
    },
  },
  resolve: {
    dedupe: ['@angular/core', '@angular/core/testing', '@angular/common'],
    alias: {
      '@core':         resolve(appRoot, 'core'),
      '@models':       resolve(appRoot, 'core/models'),
      '@services':     resolve(appRoot, 'services'),
      '@shared':       resolve(appRoot, 'shared'),
      '@features':     resolve(appRoot, 'features'),
      '@pages':        resolve(appRoot, 'pages'),
      '@guards':       resolve(appRoot, 'guards'),
      '@interceptors': resolve(appRoot, 'interceptors'),
      '@env':          resolve(srcRoot, 'environments'),
    },
  },
});
