@echo off
rem Veille hebdomadaire des appels (changement rejeu-collecte-veille, 2026-10-20) : relit les pages validees des
rem rubriques confirmees, collecte le texte des liens nouveaux, marque les fiches, ecrit VEILLE.md, lance les etapes
rem payantes dans la delegation de Monsieur DUCOUT (veille_payante.py --reel, changement veille-autonome du 2026-11-13 :
rem devis ecrit, 0,50 euro par semaine au plus, --plafond, arret avant 4,50 euros de cumul, import en « a valider »),
rem puis envoie les courriels hebdomadaires (bilan a l'administrateur, appels de la semaine aux candidats).
rem Fermer la fenetre arrete la veille (reprise possible le jour meme, rien n'est perdu) : veille_cachee.vbs la lance
rem sans fenetre.
rem Lancement planifie (tache Windows « AAP Sante - veille hebdomadaire », lundi 8 h) : veille.cmd auto
rem   -> pas de pause finale, sortie ajoutee au journal logs\veille.log. Une page deja relue le jour meme est sautee.
rem Sans boite d'envoi dans .env (SMTP_UTILISATEUR, SMTP_MOT_DE_PASSE), les courriels sont ecrits dans logs\courriels\.
chcp 65001 >nul
cd /d "%~dp0"
if "%~1"=="auto" (
  echo ==== Veille automatique du %date% %time% ====>> "logs\veille.log"
  call "%~f0" sanspause >> "logs\veille.log" 2>&1
  exit /b
)
echo Veille AAP Sante : relecture des pages validees (une page a la fois, deux secondes de pause). Zero euro.
echo.
"..\.venv\Scripts\python.exe" rejeu.py --relire --collecter --marquer --rapport
echo.
echo Portail appelsprojetsrecherche.fr (export CSV, sans navigateur ni modele) :
"..\.venv\Scripts\python.exe" portail_recherche.py
echo.
echo Portail europeen Funding ^& Tenders (interface publique, appels de sante, sans navigateur ni modele) :
"..\.venv\Scripts\python.exe" funding_tenders.py
echo.
echo Etapes payantes dans la delegation (devis, extraction, controle, qualification, import en « a valider ») :
"..\.venv\Scripts\python.exe" veille_payante.py --reel
echo.
echo Courriels hebdomadaires (bilan administrateur, appels de la semaine aux candidats) :
"..\.venv\Scripts\python.exe" alertes.py --admin --candidats
echo.
echo Chiffres publics de la page Financeurs (statistiquesPubliques/accueil) :
"..\.venv\Scripts\python.exe" ..\scripts\publier_chiffres.py
echo.
echo Recopie du journal des couts externes vers l'administration (collection coutsIa) :
"..\.venv\Scripts\python.exe" ..\scripts\publier_couts.py
echo.
echo Veille terminee le %date% %time%. Rapport : VEILLE.md.
if "%~1"=="" pause
