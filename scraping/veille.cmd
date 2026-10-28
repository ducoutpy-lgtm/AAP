@echo off
rem Veille hebdomadaire des appels (changement rejeu-collecte-veille, 2026-10-20) : relit les pages validees des
rem rubriques confirmees, collecte le texte des liens nouveaux, marque les fiches, ecrit VEILLE.md, envoie les
rem courriels hebdomadaires (bilan a l'administrateur, appels de la semaine aux candidats ; changement
rem alertes-courriel, jour 3 du plan MVP), puis affiche le devis d'extraction des textes nouveaux SANS lancer aucun
rem appel payant. L'extraction se lance ensuite a la main, apres accord :
rem   ..\.venv\Scripts\python extraction_locale.py --extraire --moteur api
rem Zero euro tant que cette fenetre tourne. Fermer la fenetre arrete la veille (reprise possible, rien n'est perdu).
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
echo Courriels hebdomadaires (bilan administrateur, appels de la semaine aux candidats) :
"..\.venv\Scripts\python.exe" alertes.py --admin --candidats
echo.
echo Chiffres publics de la page Financeurs (statistiquesPubliques/accueil) :
"..\.venv\Scripts\python.exe" ..\scripts\publier_chiffres.py
echo.
echo Recopie du journal des couts externes vers l'administration (collection coutsIa) :
"..\.venv\Scripts\python.exe" ..\scripts\publier_couts.py
echo.
echo Devis d'extraction des textes nouveaux (aucun appel n'est lance ici) :
"..\.venv\Scripts\python.exe" extraction_locale.py --extraire --moteur api --dry-run
echo.
echo Rapport : VEILLE.md. Pour extraire les textes nouveaux apres accord :
echo   ..\.venv\Scripts\python extraction_locale.py --extraire --moteur api
if "%~1"=="" pause
