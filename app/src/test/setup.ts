// Préparation commune des tests de rendu : les assertions de jest-dom (toBeInTheDocument, toHaveTextContent...)
// sont ajoutées à l'expect de Vitest. Chargé par vitest.config.ts avant chaque fichier de test.
import '@testing-library/jest-dom/vitest';
