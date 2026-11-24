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
rem Ordre (plan niveau A, lot 2.1, 2026-11-24) : le courriel des candidats part en premier, sur les fiches publiees depuis
rem le dernier envoi (la veille precedente) ; le 23/11, la relecture et la collecte ont dure plus de deux heures et l'arret
rem du poste a 10 h 13 a coupe la veille avant les courriels. Le bilan de l'administrateur suit la collecte, puis le modele
rem local, borne, en dernier (la tache Windows coupe la veille a 4 h). Python en -u : le journal est ecrit au fil de l'eau.
echo [%time%] Courriel des candidats (appels publies depuis le dernier envoi) :
"..\.venv\Scripts\python.exe" -u alertes.py --candidats
echo.
echo [%time%] Relecture des pages validees (une page a la fois, deux secondes de pause). Zero euro.
"..\.venv\Scripts\python.exe" -u rejeu.py --relire --collecter --pdf --marquer --rapport
echo.
echo [%time%] Portail appelsprojetsrecherche.fr (export CSV, sans navigateur ni modele) :
"..\.venv\Scripts\python.exe" -u portail_recherche.py
echo.
echo [%time%] Portail europeen Funding ^& Tenders (interface publique, appels de sante, sans navigateur ni modele) :
"..\.venv\Scripts\python.exe" -u funding_tenders.py
echo.
echo [%time%] Bilan de l'administrateur :
"..\.venv\Scripts\python.exe" -u alertes.py --admin
echo.
echo [%time%] Chiffres publics de la page Financeurs (statistiquesPubliques/accueil) :
"..\.venv\Scripts\python.exe" -u ..\scripts\publier_chiffres.py
echo.
echo [%time%] Recopie du journal des couts externes vers l'administration (collection coutsIa) :
"..\.venv\Scripts\python.exe" -u ..\scripts\publier_couts.py
echo.
echo [%time%] Modele local, au plus 40 textes (extraction, controle, qualification, import en « a valider », tri ; zero euro, reporte sur batterie) :
rem Demarre le serveur Ollama s'il ne tourne pas (la commande list le lance), comme la chaine des PDF
"%LOCALAPPDATA%\Programs\Ollama\ollama.exe" list >nul 2>&1
"..\.venv\Scripts\python.exe" -u veille_payante.py --reel
echo.
echo Veille terminee le %date% %time%. Rapport : VEILLE.md.
if "%~1"=="" pause
