@echo off
rem Lanceur de la validation des pages des sources (Monsieur DUCOUT) : demarre le serveur local puis ouvre le navigateur.
rem Pourquoi un .cmd : un raccourci Windows ne peut pas lancer python avec ses arguments ET ouvrir le navigateur ;
rem ce fichier fait les deux. Fermer cette fenetre noire arrete le serveur.
chcp 65001 >nul
cd /d "%~dp0"
set PORT=8788
echo Validation manuelle des AAP : les 155 pages gardees par la decouverte (etape 2 de la feuille de route).
echo Verdicts enregistres dans sources\verdicts_pages.json. Fermer cette fenetre pour arreter.
echo.
rem Le navigateur s ouvre deux secondes apres, le temps que le serveur demarre.
start "" /min cmd /c "timeout /t 2 >nul & start "" http://localhost:%PORT%"
"..\.venv\Scripts\python.exe" validation.py --pages --port %PORT%
pause
