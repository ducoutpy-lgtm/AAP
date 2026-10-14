@echo off
rem Lanceur du jugement de la comparaison des moteurs sur 50 pages (Monsieur DUCOUT) : demarre le serveur local
rem puis ouvre le navigateur. Meme principe que validation_pages.cmd. Fermer cette fenetre noire arrete le serveur.
chcp 65001 >nul
cd /d "%~dp0"
set PORT=8766
echo Comparaison des moteurs sur 50 pages : pour chaque page, dire si c'est un appel, puis juger chaque fiche.
echo Verdicts enregistres dans sources\verdicts_comparaison.json. Fermer cette fenetre pour arreter.
echo.
rem Le navigateur s ouvre deux secondes apres, le temps que le serveur demarre.
start "" /min cmd /c "timeout /t 2 >nul & start "" http://localhost:%PORT%"
"..\.venv\Scripts\python.exe" comparaison.py --juger --port %PORT%
pause
