@echo off
rem Lanceur de la validation manuelle des AAP (Monsieur DUCOUT) : demarre le serveur local puis ouvre le navigateur.
rem Pourquoi un .cmd : un raccourci Windows ne peut pas lancer python avec ses arguments ET ouvrir le navigateur ;
rem ce fichier fait les deux. Fermer cette fenetre noire arrete le serveur.
chcp 65001 >nul
cd /d "%~dp0"
set PORT=8787
echo Validation manuelle des AAP : echantillon de 60 liens repartis entre les sources.
echo Verdicts enregistres dans sources\verdicts_liens.json. Fermer cette fenetre pour arreter.
echo.
rem Le navigateur s ouvre deux secondes apres, le temps que le serveur demarre.
start "" /min cmd /c "timeout /t 2 >nul & start "" http://localhost:%PORT%"
"..\.venv\Scripts\python.exe" validation.py --liens --echantillon 60 --port %PORT%
pause
