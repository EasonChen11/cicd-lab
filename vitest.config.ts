import type { TestUserConfig, ViteUserConfig } from 'vitest/config';

type VitestConfig = ViteUserConfig & {
  test?: TestUserConfig;
};

const config: VitestConfig = {
  test: {
    exclude: ['dist/**', 'node_modules/**'],
    reporters: process.env.CI
      ? ['default', ['junit', { outputFile: 'reports/junit.xml' }]]
      : ['default']
  }
};

export default config;
