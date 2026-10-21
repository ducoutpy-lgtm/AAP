// Pré-remplissage d'une candidature à partir du dossier PDF du candidat (jour 5 du plan MVP, changement
// candidature-depuis-pdf, 2026-10-21). Pourquoi une fonction serveur : la clé Anthropic ne doit jamais être dans le
// navigateur. Le PDF est envoyé tel quel au modèle (bloc document), qui répond par un outil à champs fermés.
// Modèle : claude-haiku-5-5 (décision de Monsieur DUCOUT du 2026-10-19 : Haiku, plafond cumulé 5 euros).
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Anthropic from '@anthropic-ai/sdk';

const MODELE = 'claude-haiku-5-5';
const TAILLE_MAX_OCTETS = 20 * 1024 * 1024; // 20 Mo de PDF, bien sous la limite de 32 Mo de l'API
const PLAFOND_EUROS_PAR_MOIS = 5;
const EURO_PAR_DOLLAR = 0.92;
// Tarif Haiku 5.5 (USD par million de tokens, prompts jusqu'à 100 000 tokens)
const PRIX_ENTREE = 0.1;
const PRIX_SORTIE = 0.5;

const OUTIL: Anthropic.Tool = {
  name: 'candidature',
  description: "Champs de la candidature lus dans le dossier du candidat. Ne rien inventer : vide ou null si le dossier ne le dit pas.",
  strict: true,
  input_schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      titre_projet: { type: 'string', description: 'Titre du projet tel que le dossier le nomme, ou une formulation courte fidèle' },
      resume: { type: 'string', description: 'Résumé du projet en cinq à dix lignes : quoi, pour qui, où, quand, avec quels moyens' },
      montant_demande: { type: ['number', 'null'], description: 'Montant demandé au financeur, en euros, ou null' },
      structure: { type: 'string', description: 'Nom de la structure candidate, ou vide' },
      calendrier: { type: 'string', description: 'Dates ou durée du projet si le dossier les donne, sinon vide' },
      confiance: { type: 'string', enum: ['haute', 'moyenne', 'basse'], description: 'Confiance dans la lecture' },
      remarque: { type: 'string', description: "Ce qui manque au dossier pour l'appel visé, une phrase, ou vide" },
    },
    required: ['titre_projet', 'resume', 'montant_demande', 'structure', 'calendrier', 'confiance', 'remarque'],
  },
};

export function coutEuros(entree: number, sortie: number): number {
  return ((entree * PRIX_ENTREE + sortie * PRIX_SORTIE) / 1_000_000) * EURO_PAR_DOLLAR;
}

interface Donnees {
  aapId: string;
  nomFichier: string;
  pdfBase64: string;
}

export const preremplirCandidature = functions
  .region('europe-west1')
  .runWith({ secrets: ['ANTHROPIC_API_KEY'], memory: '512MB', timeoutSeconds: 120 })
  .https.onCall(async (donnees: Donnees, contexte) => {
    if (!contexte.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Connexion requise');
    }
    const { aapId, nomFichier, pdfBase64 } = donnees || ({} as Donnees);
    if (!aapId || !pdfBase64 || typeof pdfBase64 !== 'string') {
      throw new functions.https.HttpsError('invalid-argument', 'Appel et fichier PDF requis');
    }
    const octets = Math.floor((pdfBase64.length * 3) / 4);
    if (octets > TAILLE_MAX_OCTETS) {
      throw new functions.https.HttpsError('invalid-argument', 'Fichier trop lourd (20 Mo au plus)');
    }

    const db = admin.firestore();
    // Plafond mensuel : la somme des coûts du mois ne dépasse jamais 5 euros (règle absolue du projet)
    const debutMois = new Date();
    debutMois.setDate(1);
    debutMois.setHours(0, 0, 0, 0);
    const couts = await db.collection('coutsIa').where('le', '>=', admin.firestore.Timestamp.fromDate(debutMois)).get();
    const depense = couts.docs.reduce((somme, d) => somme + (d.data().coutEuros || 0), 0);
    if (depense >= PLAFOND_EUROS_PAR_MOIS) {
      throw new functions.https.HttpsError('resource-exhausted', 'Plafond mensuel de lecture atteint : prévenez l\'administrateur');
    }

    const appel = await db.collection('aap').doc(aapId).get();
    const a = appel.exists ? appel.data() || {} : {};
    const contexteAppel = [
      `Appel visé : ${a.title || ''}`,
      a.financeurName ? `Financeur : ${a.financeurName}` : '',
      a.eligibilityCriteria ? `Critères : ${String(a.eligibilityCriteria).slice(0, 1500)}` : '',
    ].filter(Boolean).join('\n');

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    let reponse: Anthropic.Message;
    try {
      reponse = await client.messages.create({
        model: MODELE,
        max_tokens: 2048,
        system:
          "Tu lis le dossier de candidature d'un établissement de santé ou médico-social français et tu remplis les champs " +
          "d'une candidature en appelant l'outil candidature. Tu n'inventes rien : un champ que le dossier ne donne pas " +
          "reste vide ou null. Le résumé reprend les mots du dossier, en français, sans formule publicitaire.",
        tools: [OUTIL],
        tool_choice: { type: 'auto' },
        messages: [{
          role: 'user',
          content: [
            { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 }, title: nomFichier || 'dossier.pdf' },
            { type: 'text', text: `${contexteAppel}\n\nLis le dossier ci-joint et appelle l'outil candidature.` },
          ],
        }],
      });
    } catch (err) {
      if (err instanceof Anthropic.RateLimitError) {
        throw new functions.https.HttpsError('resource-exhausted', 'Service de lecture saturé, réessayez dans une minute');
      }
      if (err instanceof Anthropic.BadRequestError) {
        throw new functions.https.HttpsError('invalid-argument', 'Le fichier n\'a pas pu être lu (PDF attendu, 100 pages au plus)');
      }
      if (err instanceof Anthropic.APIError) {
        throw new functions.https.HttpsError('unavailable', `Service de lecture indisponible (${err.status})`);
      }
      throw err;
    }

    const cout = coutEuros(reponse.usage.input_tokens, reponse.usage.output_tokens);
    await db.collection('coutsIa').add({
      userId: contexte.auth.uid, fonction: 'preremplirCandidature', aapId, modele: MODELE,
      tokensEntree: reponse.usage.input_tokens, tokensSortie: reponse.usage.output_tokens, coutEuros: cout,
      le: admin.firestore.FieldValue.serverTimestamp(),
    });

    if (reponse.stop_reason === 'refusal') {
      throw new functions.https.HttpsError('failed-precondition', 'Le modèle a refusé de lire ce document');
    }
    const bloc = reponse.content.find((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use');
    if (!bloc) {
      throw new functions.https.HttpsError('internal', 'Aucun champ lu dans le dossier');
    }
    return { champs: bloc.input, coutEuros: cout, tokens: reponse.usage.input_tokens + reponse.usage.output_tokens };
  });
