import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  // `.cache` holds Puppeteer's downloaded Chrome binary + its bundled browser
  // extension resources (see .puppeteerrc.cjs) — not our source, and its
  // vendored JS uses browser globals (document/chrome/trustedTypes) ESLint's
  // Node-only config here doesn't know about. Never committed (gitignored),
  // but a fresh `npm ci`/`npm install` on CI or locally re-downloads it every
  // time via the `postinstall` script, so it must be excluded here too.
  globalIgnores(['node_modules', 'data', '.cache']),
  {
    files: ['**/*.mjs', '**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.node,
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['**/*.ts'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.node,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
]);
