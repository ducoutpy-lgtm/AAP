// Messages d'erreur compréhensibles (plan niveau A, lot 3.1, 2026-11-24) : les écrans montraient tel quel le texte
// anglais de Firebase. Un code connu est traduit ; un message écrit par l'application (en français) est gardé ; tout
// autre texte technique est remplacé par le message prévu par l'écran.

const TRADUCTIONS: Record<string, string> = {
  'auth/invalid-credential': 'Adresse ou mot de passe incorrect.',
  'auth/wrong-password': 'Adresse ou mot de passe incorrect.',
  'auth/user-not-found': 'Adresse ou mot de passe incorrect.',
  'auth/invalid-email': 'Adresse électronique invalide.',
  'auth/email-already-in-use': 'Un compte existe déjà avec cette adresse.',
  'auth/weak-password': 'Mot de passe trop faible : 6 caractères au moins.',
  'auth/popup-closed-by-user': 'Fenêtre de connexion fermée avant la fin : recommencez.',
  'auth/cancelled-popup-request': 'Fenêtre de connexion fermée avant la fin : recommencez.',
  'auth/popup-blocked': 'Le navigateur a bloqué la fenêtre de connexion : autorisez-la, puis recommencez.',
  'auth/too-many-requests': 'Trop de tentatives : réessayez dans quelques minutes.',
  'auth/requires-recent-login': 'Par sécurité, déconnectez-vous, reconnectez-vous, puis recommencez.',
  'auth/network-request-failed': 'Connexion au service impossible : vérifiez votre connexion Internet, puis réessayez.',
  unavailable: 'Connexion au service impossible : vérifiez votre connexion Internet, puis réessayez.',
  'permission-denied': "Action refusée : vous n'avez pas les droits nécessaires.",
  // Code posé par AuthContext quand la règle refuse la création du document users (registre des suspensions, question 51)
  'compte-suspendu':
    'Inscription refusée : ce compte ou cette adresse électronique est suspendu. Pour en savoir plus, écrivez-nous depuis la page Contact.',
  'not-found': 'Élément introuvable : il a peut-être été supprimé.',
  'storage/unauthorized': 'Dépôt du fichier refusé par le stockage.',
};

export function messageErreur(err: unknown, defaut: string): string {
  const code = (err as { code?: unknown } | null)?.code;
  if (typeof code === 'string') return TRADUCTIONS[code] ?? defaut;
  if (err instanceof Error && err.message && !/firebase|error|\(.*\/.*\)/i.test(err.message)) return err.message;
  return defaut;
}
