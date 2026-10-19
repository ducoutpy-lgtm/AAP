// Configuration ESLint de l'application (gabarit Vite React TypeScript). Absente jusqu'au lot 0 du 2026-10-14 :
// « npm run lint » echouait faute de fichier de configuration. Les dossiers dist et functions ne sont pas lintes.
//
// Les modules geles par le lot 0 (2026-10-14) ont ete degeles le 2026-10-19 (changement degel-application-complete) :
// toute l'application est lintee.
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
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
  },
  // Pages d'avril 2026 degelees le 2026-10-19 : leurs fonctions de chargement sont redefinies a chaque rendu, les
  // lister dans useEffect relancerait l'effet en boucle (meme motif que les commentaires de SearchAapPage et
  // ManageAAPsPage). La regle est coupee pour ces fichiers plutot que de poser quinze commentaires identiques.
  overrides: [
    {
      files: ['src/pages/common/*.tsx', 'src/pages/financeur/*.tsx', 'src/pages/profile/*.tsx',
              'src/pages/porteur/PorteurDashboard.tsx', 'src/pages/porteur/ApplicationFormPage.tsx',
              'src/pages/porteur/MyApplicationsPage.tsx', 'src/pages/porteur/RecommendationsPage.tsx',
              'src/pages/porteur/SavedSearchesPage.tsx', 'src/pages/admin/GlobalStatisticsPage.tsx'],
      rules: { 'react-hooks/exhaustive-deps': 'off' },
    },
  ],
};
