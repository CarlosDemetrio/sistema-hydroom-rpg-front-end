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
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    server: {
      deps: {
        inline: [/@angular/, /primeng/, /@primeng/, /@testing-library/],
      },
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
