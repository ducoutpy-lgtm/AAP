@echo off
rem Veille hebdomadaire des appels (changement rejeu-collecte-veille, 2026-10-20) : relit les pages validees des
rem rubriques confirmees, collecte le texte des liens nouveaux, marque les fiches, ecrit VEILLE.md, envoie les courriels
rem hebdomadaires (bilan a l'administrateur, appels de la semaine aux candidats) et publie les chiffres, puis lance
rem l'extraction, le controle et la qualification par le modele local, au plus 40 textes (veille_payante.py --reel,
rem changements veille-modele-local du 2026-11-21 et corrections-chaine-du-lundi du 2026-11-22 : zero euro, reportes sur
rem batterie, import en « a valider » puis tri ; l'API Haiku seulement sur demande de Monsieur DUCOUT, --moteur api).
rem Ordre choisi par Monsieur DUCOUT le 2026-11-22 (« Ordre des etapes ») : la tache Windows coupe la veille a 4 h.
rem Fermer la fenetre arrete la veille (reprise possible le jour meme, rien n'est perdu) : veille_cachee.vbs la lance
rem sans fenetre.
rem Lancement planifie (tache Windows « AAP Sante - veille hebdomadaire », lundi 8 h) : veille.cmd auto
rem   -> pas de pause finale, sortie ajoutee au journal logs\veille.log. Une page deja relue le jour meme est sautee.
rem Sans boite d'envoi dans .env (SMTP_UTILISATEUR, SMTP_MOT_DE_PASSE), les courriels sont ecrits dans logs\courriels\.
chcp 65001 >nul
rem Sortie de Python en UTF-8 pour toute la chaîne (journal homogène, devis lisibles ; 2026-11-16)
set PYTHONUTF8=1
cd /d "%~dp0"
if "%~1"=="auto" (
  echo ==== Veille automatique du %date% %time% ====>> "logs\veille.log"
  call "%~f0" sanspause >> "logs\veille.log" 2>&1
  exit /b
)
echo Veille AAP Sante : relecture des pages validees (une page a la fois, deux secondes de pause). Zero euro.
echo.
"..\.venv\Scripts\python.exe" rejeu.py --relire --collecter --pdf --marquer --rapport
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
rem Courriels et chiffres d'abord : la tache Windows coupe la veille a 4 h (decision « Ordre des etapes » du 2026-11-22)
echo Modele local, au plus 40 textes (extraction, controle, qualification, import en « a valider », tri ; zero euro, reporte sur batterie) :
rem Demarre le serveur Ollama s'il ne tourne pas (la commande list le lance), comme la chaine des PDF
"%LOCALAPPDATA%\Programs\Ollama\ollama.exe" list >nul 2>&1
"..\.venv\Scripts\python.exe" veille_payante.py --reel
echo.
echo Veille terminee le %date% %time%. Rapport : VEILLE.md.
if "%~1"=="" pause
