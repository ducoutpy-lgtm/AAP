"""
SETUP — À EXÉCUTER UNE SEULE FOIS
Crée l'environnement et l'agent, puis sauvegarde les IDs dans config.json.
"""

import anthropic
import json
import os

client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

# 1. Créer l'environnement
print("Création de l'environnement...")
environment = client.beta.environments.create(
    name="scraping-aap-sante",
    config={
        "type": "cloud",
        "networking": {"type": "unrestricted"},
    },
)
print(f"  ✓ Environment ID : {environment.id}")

# 2. Créer l'agent
print("Création de l'agent...")
agent = client.beta.agents.create(
    name="Scrapping AAP Sante",
    model="claude-opus-4-7",
    system="""Tu es un agent spécialisé dans la veille et la collecte d'appels à projets dans le domaine de la santé en France.

Ton rôle à chaque exécution :
1. Installer les bibliothèques Python nécessaires : requests, beautifulsoup4, lxml, openpyxl, python-dateutil
2. Scraper chaque URL fournie et extraire tous les appels à projets présents sur la page
3. Pour chaque appel à projet, extraire ces champs (laisser vide si non trouvé) :
   - titre : intitulé complet de l'appel à projet
   - description : résumé ou objectif de l'appel
   - date_debut : date d'ouverture ou de publication
   - date_fin : date limite de dépôt / clôture
   - criteres_eligibilite : conditions pour candidater
   - thematique : domaine de santé concerné (ex: cancer, autonomie, prévention...)
   - url_source : l'URL scrapée
4. Vérifier si le fichier /workspace/aap_sante.xlsx existe :
   - S'il existe : charger les données existantes, identifier les nouvelles entrées
     (une entrée est nouvelle si la combinaison titre + url_source n'existe pas déjà)
   - S'il n'existe pas : créer un nouveau fichier avec les en-têtes appropriées
5. Ajouter uniquement les nouvelles entrées avec la colonne date_ajout horodatée
6. Sauvegarder le fichier Excel mis à jour dans /mnt/session/outputs/aap_sante.xlsx

Sois méthodique et robuste : traite chaque URL indépendamment, gère les erreurs de connexion
(timeout, 403, etc.) sans interrompre le traitement des autres URLs. Indique clairement
combien d'appels ont été trouvés et ajoutés à la fin.""",
    tools=[
        {
            "type": "agent_toolset_20260401",
            "default_config": {"enabled": True},
        },
    ],
    skills=[
        {"type": "anthropic", "skill_id": "xlsx"},
    ],
)
print(f"  ✓ Agent ID      : {agent.id}")
print(f"  ✓ Agent version : {agent.version}")

# 3. Sauvegarder les IDs
config = {
    "environment_id": environment.id,
    "agent_id": agent.id,
    "agent_version": agent.version,
}
with open("config.json", "w") as f:
    json.dump(config, f, indent=2)

print("\n✅ Setup terminé. IDs sauvegardés dans config.json")
print("   Lancez run_scraping.py pour démarrer le premier scraping.")
