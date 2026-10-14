@echo off
rem Lanceur de la relecture des sources exclues par la qualification (hors sante, a verifier, sans AAP, PDF seulement).
rem Demande de Monsieur DUCOUT du 2026-10-13 apres le cas Bpifrance : une source mixte doit etre jugee par un humain.
rem Fermer cette fenetre noire arrete le serveur.
chcp 65001 >nul
cd /d "%~dp0"
set PORT=8790
echo Relecture des sources exclues : pages gardees des sources hors sante, a verifier, sans AAP ou PDF seulement.
echo Verdicts enregistres dans sources\verdicts_pages.json. Fermer cette fenetre pour arreter.
echo.
rem Le navigateur s ouvre deux secondes apres, le temps que le serveur demarre.
start "" /min cmd /c "timeout /t 2 >nul & start "" http://localhost:%PORT%"
"..\.venv\Scripts\python.exe" validation.py --pages --verdicts hors-sante,a-verifier,pas-d-aap,pdf-seulement --port %PORT%
pause
