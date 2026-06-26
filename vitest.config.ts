import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

const dirname =
  typeof __dirname !== 'undefined'
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

// Mirror the tsconfig path aliases (e.g. `@/services/foo` -> `<root>/src/services/foo`).
// Using regex find so the trailing path segment after `@/` is preserved.
const alias = {
  find: /^@\/(.*)$/,
  replacement: `${path.join(dirname, 'src')}/$1`,
};

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    projects: [
      // Node-based unit tests for libraries, services, and helpers that
      // don't require a browser. This project has no `extends: true` so it
      // can't accidentally pull in browser/Storybook defaults.
      {
        resolve: { alias: [alias] },
        test: {
          name: 'unit',
          environment: 'node',
          include: ['src/**/*.test.ts'],
          exclude: [
            'src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
            'src/**/*.test.tsx',
            'node_modules/**',
          ],
        },
      },
      {
        extends: true,
        optimizeDeps: {
          include: ['@phosphor-icons/react', '@tanstack/react-virtual'],
        },
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          storybookTest({ configDir: path.join(dirname, '.storybook') }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
      {
        // Lightweight Node unit-test project for plain *.test.ts/*.spec.ts
        // files. Excludes Storybook stories so they keep running under the
        // `storybook` project above.
        extends: true,
        test: {
          name: 'unit',
          environment: 'happy-dom',
          include: ['src/**/*.{test,spec}.{ts,tsx}'],
          exclude: [
            '**/*.stories.{ts,tsx}',
            '**/*.stories.test.{ts,tsx}',
            'node_modules/**',
            '.next/**',
          ],
        },
      },
    ],
  },
});
