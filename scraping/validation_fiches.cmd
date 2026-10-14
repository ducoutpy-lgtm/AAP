@echo off
rem Lanceur de la validation des fiches extraites par le modele local (Monsieur DUCOUT) : demarre le serveur local
rem puis ouvre le navigateur. Les fiches viennent de results\extraction_locale.json (changement
rem extraction-locale-globale) ; la page s ouvre sur la premiere fiche sans verdict, donc le raccourci sert tout
rem le temps : relancer apres un nouveau passage d extraction pour voir les fiches nouvelles.
rem Fermer cette fenetre noire arrete le serveur.
chcp 65001 >nul
cd /d "%~dp0"
set PORT=8789
echo Validation des fiches a verifier : fiches produites par le modele local (results\extraction_locale.json).
echo Verdicts enregistres dans results\validation_manuelle.json. Fermer cette fenetre pour arreter.
echo.
rem Le navigateur s ouvre deux secondes apres, le temps que le serveur demarre.
start "" /min cmd /c "timeout /t 2 >nul & start "" http://localhost:%PORT%"
"..\.venv\Scripts\python.exe" validation.py --fichier results\extraction_locale.json --port %PORT%
pause
