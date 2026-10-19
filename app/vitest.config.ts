// Configuration des tests de l'application (changement degel-application-complete, 2026-10-19).
// Deux familles : les tests unitaires et de rendu dans src/ (navigateur simulé jsdom, aucun appel Firebase) et les
// tests des règles Firestore dans tests/rules (environnement node, lancés par npm run test:rules dans l'émulateur).
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    include: ['src/**/*.test.{ts,tsx}', 'tests/rules/**/*.test.ts'],
    environmentMatchGlobs: [
      ['src/**', 'jsdom'],
      ['tests/rules/**', 'node'],
    ],
    setupFiles: ['src/test/setup.ts'],
    globals: false,
  },
});
