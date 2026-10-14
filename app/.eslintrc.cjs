// Configuration ESLint de l'application (gabarit Vite React TypeScript). Absente jusqu'au lot 0 du 2026-10-14 :
// « npm run lint » echouait faute de fichier de configuration. Les dossiers dist et functions ne sont pas lintes.
//
// Fichiers des modules geles (rapport de critique du 2026-10-14, instruction 1 : porteur, financeur, candidatures,
// messagerie, notifications, calendrier, statistiques, recommandations, abonnement, paiement, inscription) : ignores
// plutot que corriges, leur code ne doit pas changer avant le lot 4. A retirer d'ici quand ces modules reviendront.
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: [
    'dist',
    'functions',
    '.eslintrc.cjs',
    // Modules geles
    'src/pages/common/',
    'src/pages/financeur/',
    'src/pages/profile/',
    'src/pages/subscription/',
    'src/pages/admin/GlobalStatisticsPage.tsx',
    'src/pages/auth/SignupPage.tsx',
    'src/pages/porteur/ApplicationFormPage.tsx',
    'src/pages/porteur/MyApplicationsPage.tsx',
    'src/pages/porteur/PorteurDashboard.tsx',
    'src/pages/porteur/RecommendationsPage.tsx',
    'src/pages/porteur/SavedSearchesPage.tsx',
    'src/components/guards/SubscriptionGuard.tsx',
    'src/config/stripe.ts',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
  },
};
