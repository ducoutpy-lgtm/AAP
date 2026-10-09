"""
RUNTIME — À LANCER CHAQUE JOUR (cron, Task Scheduler, GitHub Actions...)
Lit les IDs depuis config.json, crée une session, scrape les URLs, télécharge l'Excel.
"""

import anthropic
import json
import os
import time
from datetime import datetime
from pathlib import Path

# ─── Configuration ────────────────────────────────────────────────────────────

EXCEL_PATH = Path("aap_sante.xlsx")

URLS = [
    "https://anr.fr/fr/appels-a-projets/",
    "https://www.ars.sante.fr/appels-projets",
    "https://www.grand-est.ars.sante.fr/appels-projets-et-candidatures",
    "https://www.nouvelle-aquitaine.ars.sante.fr/appels-projets",
    "https://www.occitanie.ars.sante.fr/appels-projets",
    "https://www.paca.ars.sante.fr/appels-projets",
    "https://www.auvergne-rhone-alpes.ars.sante.fr/appels-projets",
    "https://www.bretagne.ars.sante.fr/appels-projets",
    "https://www.centre-val-de-loire.ars.sante.fr/appels-projets",
    "https://www.bourgogne-franche-comte.ars.sante.fr/appels-projets",
    "https://www.hauts-de-france.ars.sante.fr/appels-projets",
    "https://www.normandie.ars.sante.fr/appels-projets",
    "https://www.pays-de-la-loire.ars.sante.fr/appels-projets",
    "https://www.idf.ars.sante.fr/appels-projets",
    "https://www.frm.org/chercheurs/appels-a-projets",
    "https://www.fondationdefrance.org/fr/appels-a-projets",
    "https://www.bpifrance.fr/nos-appels-a-projets-concours",
    "https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/opportunities/topic-search",
    "https://www.cnsa.fr/grands-age-et-autonomie/appels-a-projets",
    "https://www.santepubliquefrance.fr/a-propos/appels-a-projets",
    "https://www.inserm.fr/recherche/appels-a-projets/",
    "https://www.e-cancer.fr/Professionnels-de-la-recherche/Appels-a-projets",
    "https://www.anrs.fr/fr/recherche/appels-projets",
    "https://fondation-maladiesrares.org/appels-a-projets/",
    "https://www.fondation-arc.org/chercheurs/appels-projets",
    "https://www.fondation-alzheimer.org/appels-a-projets/",
    "https://fehap.fr/appels-a-projets",
    "https://www.agence-biomedecine.fr/Recherche-et-innovation",
    "https://agirpourlatransition.ademe.fr/entreprises/aides-financieres",
    "https://www.ameli.fr/assure/sante/assurance-maladie/appels-projets",
    "https://www.fhf.fr/Offres-de-services/Appels-a-projets",
    "https://solidarites-sante.gouv.fr/systeme-de-sante/dgos/appels-a-projets",
    "https://www.iledefrance.fr/appels-projets",
    "https://www.auvergnerhonealpes.fr/aide/liste",
    "https://www.laregion.fr/Appels-a-projets",
    "https://les-aides.nouvelle-aquitaine.fr/",
    "https://www.grandest.fr/vos-aides-regionales/",
    "https://www.fondationbs.org/appels-a-projets",
    "https://www.fondation-macsf.fr/appels-a-projets",
    "https://www.fondationhopitaux.fr/nos-actions/appels-a-projets/",
    "https://www.iresp.net/appels-a-projets/",
    "https://www.aviesan.fr/aviesan/accueil",
    "https://www.paris.fr/pages/les-appels-a-projets-8135",
]

# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    now = datetime.now()
    print(f"\n{'='*60}")
    print(f"  Scraping AAP Santé — {now.strftime('%d/%m/%Y %H:%M')}")
    print(f"{'='*60}\n")

    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

    # Charger les IDs
    with open("config.json") as f:
        config = json.load(f)

    # Uploader l'Excel existant si présent
    resources = []
    uploaded_file_id = None

    if EXCEL_PATH.exists():
        print(f"Upload de l'Excel existant : {EXCEL_PATH}")
        with open(EXCEL_PATH, "rb") as f:
            uploaded = client.beta.files.upload(file=f)
        uploaded_file_id = uploaded.id
        resources.append({
            "type": "file",
            "file_id": uploaded.id,
            "mount_path": "/workspace/aap_sante.xlsx",
        })
        print(f"  ✓ Fichier uploadé : {uploaded.id}\n")

    # Créer la session
    print("Création de la session...")
    session = client.beta.sessions.create(
        agent={"type": "agent", "id": config["agent_id"], "version": config["agent_version"]},
        environment_id=config["environment_id"],
        title=f"Scraping AAP Sante - {now.strftime('%Y-%m-%d')}",
        resources=resources,
    )
    print(f"  ✓ Session : {session.id}\n")

    # Construire le message
    urls_list = "\n".join(f"- {url}" for url in URLS)
    message = f"""Lance le scraping des appels à projets santé.
Date du jour : {now.strftime('%d/%m/%Y %H:%M')}

URLs à scraper ({len(URLS)} sources) :
{urls_list}

Extrais pour chaque appel : titre, description, date_debut, date_fin, criteres_eligibilite, thematique, url_source.

Si /workspace/aap_sante.xlsx existe déjà, charge-le et ajoute uniquement les nouvelles entrées
(déduplique par titre + url_source). Horodate chaque nouvelle ligne avec date_ajout = {now.strftime('%Y-%m-%d %H:%M')}.

Sauvegarde le résultat final dans /mnt/session/outputs/aap_sante.xlsx.
"""

    # Ouvrir le stream AVANT d'envoyer (stream-first)
    print("Lancement du scraping (streaming en cours)...\n")

    with client.beta.sessions.stream(session_id=session.id) as stream:
        client.beta.sessions.events.send(
            session_id=session.id,
            events=[{
                "type": "user.message",
                "content": [{"type": "text", "text": message}],
            }],
        )

        for event in stream:
            if event.type == "agent.message":
                for block in event.content:
                    if block.type == "text":
                        print(block.text, end="", flush=True)
            elif event.type == "session.error":
                print(f"\n⚠️  Erreur session : {event}")
            elif event.type == "session.status_terminated":
                break
            elif event.type == "session.status_idle":
                if event.stop_reason.type != "requires_action":
                    break

    print("\n\n--- Session terminée, récupération du fichier Excel ---\n")

    # Attendre l'indexation des fichiers (délai ~1-3s)
    time.sleep(4)

    # Télécharger l'Excel depuis les outputs de la session
    files = client.beta.files.list(
        scope_id=session.id,
        betas=["managed-agents-2026-04-01"],
    )

    excel_downloaded = False
    for f in files.data:
        if f.filename.endswith(".xlsx"):
            print(f"Téléchargement : {f.filename} ({f.size_bytes} octets)")
            content = client.beta.files.download(f.id)
            content.write_to_file(str(EXCEL_PATH))
            print(f"  ✓ Sauvegardé : {EXCEL_PATH}")
            excel_downloaded = True
            break

    if not excel_downloaded:
        print("⚠️  Aucun fichier Excel trouvé dans les outputs de la session.")
        print("   Vérifiez les logs ci-dessus pour identifier l'erreur.")

    # Nettoyage du fichier temporaire uploadé
    if uploaded_file_id:
        try:
            client.beta.files.delete(uploaded_file_id)
            print(f"  ✓ Fichier temporaire supprimé : {uploaded_file_id}")
        except Exception:
            pass

    print(f"\n✅ Scraping terminé — {now.strftime('%d/%m/%Y %H:%M')}\n")


if __name__ == "__main__":
    main()
