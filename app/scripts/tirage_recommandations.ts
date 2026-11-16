// Tirage de vingt recommandations à juger par Monsieur DUCOUT (changement recommandations-profil, tâche 5.0,
// 2026-11-16). Utilise la fonction recommander de l'application sur quatre profils types et les fiches visibles
// exportées par scripts/exporter_fiches_visibles.py ; graine fixe, donc tirage rejouable. Zéro euro.
//   npx vite-node scripts/tirage_recommandations.ts
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { recommander, type ProfilReco } from '../src/utils/recommandations';

const racine = (chemin: string) => fileURLToPath(new URL(`../../${chemin}`, import.meta.url));
const fiches = (JSON.parse(readFileSync(racine('scripts/sauvegardes/fiches_visibles.json'), 'utf8')) as Record<string, unknown>[])
  .map(f => ({ ...f, deadline: f.deadline ? new Date(f.deadline as string) : null }));

const PROFILS: { nom: string; profil: ProfilReco }[] = [
  { nom: 'EHPAD public, Évry (Île-de-France)', profil: { structureType: 'etablissement-public', typeEtablissement: 'ehpad', objetsProjet: ['prevention', 'qvt'], address: { postalCode: '91000' } } as ProfilReco },
  { nom: 'Association de prévention, Toulouse (Occitanie)', profil: { structureType: 'association', typeEtablissement: 'prevention', objetsProjet: ['prevention'], address: { postalCode: '31000' } } as ProfilReco },
  { nom: 'SSIAD associatif, Rennes (Bretagne)', profil: { structureType: 'association', typeEtablissement: 'ssiad', objetsProjet: ['coordination-parcours', 'numerique'], address: { postalCode: '35000' } } as ProfilReco },
  { nom: 'Centre de santé, Lille (Hauts-de-France)', profil: { structureType: 'exercice-coordonne', typeEtablissement: 'centre-sante', objetsProjet: ['coordination-parcours'], address: { postalCode: '59000' } } as ProfilReco },
];

// Générateur pseudo-aléatoire à graine (mulberry32) : même graine, même tirage
function hasard(graine: number) {
  return () => {
    graine = (graine + 0x6d2b79f5) | 0;
    let t = Math.imul(graine ^ (graine >>> 15), 1 | graine);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const toutes = PROFILS.flatMap(p => recommander(fiches as never[], p.profil).map(r => ({ profil: p.nom, r })));
const tirer = hasard(20261116);
const melange = [...toutes].sort((a, b) => (a.r.aap as { id: string }).id.localeCompare((b.r.aap as { id: string }).id) || a.profil.localeCompare(b.profil));
for (let i = melange.length - 1; i > 0; i--) {
  const j = Math.floor(tirer() * (i + 1));
  [melange[i], melange[j]] = [melange[j], melange[i]];
}
const vingt = melange.slice(0, 20);

const lignes = [
  '# Tirage de vingt recommandations à juger',
  '',
  `Changement \`recommandations-profil\`, tâche 5.0 (2026-11-16). ${fiches.length} fiches visibles, quatre profils types, ` +
  `${toutes.length} recommandations en tout (${PROFILS.map(p => `${p.nom} : ${toutes.filter(t => t.profil === p.nom).length}`).join(' ; ')}), ` +
  'vingt tirées au hasard (graine 20261116). Critère de la semaine 2 : au moins dix-huit jugées pertinentes.',
  '',
  'Pour chaque ligne, Monsieur DUCOUT note « oui » ou « non » dans la dernière colonne (pertinent pour ce profil).',
  '',
  '| N° | Profil | Appel | Points | Pourquoi | À vérifier | Pertinent ? |',
  '|---|---|---|---|---|---|---|',
  ...vingt.map(({ profil, r }, i) => {
    const a = r.aap as unknown as { id: string; title: string; financeurName?: string };
    const titre = `[${a.title.replace(/\|/g, '/')}](https://aapi-11bc3.web.app/aap/${a.id}) (${a.financeurName ?? 'financeur non précisé'})`;
    return `| ${i + 1} | ${profil} | ${titre} | ${r.points} | ${r.raisons.join(' ; ')} | ${r.aVerifier.join(' ; ')} | |`;
  }),
  '',
];
writeFileSync(racine('docs/TIRAGE_RECOMMANDATIONS.md'), lignes.join('\n'), 'utf8');
console.log(`${toutes.length} recommandations, ${vingt.length} tirées -> docs/TIRAGE_RECOMMANDATIONS.md`);
