@echo off
rem Lanceur de l'application AAP Sante pour Monsieur DUCOUT (raccourci « AAP Sante » sur le bureau, 2026-10-19) :
rem demarre le serveur de developpement (Vite, port 3000) puis ouvre le navigateur sur l'accueil (decision du 2026-10-20).
rem Fermer cette fenetre noire arrete le serveur. Si le port 3000 est deja pris, une autre instance tourne deja :
rem ouvrir simplement http://localhost:3000.
chcp 65001 >nul
cd /d "%~dp0"
echo AAP Sante : demarrage du serveur local (http://localhost:3000). Fermer cette fenetre pour arreter.
echo.
if not exist node_modules (
  echo Premiere utilisation : installation des dependances, quelques minutes...
  call npm install
)
rem Le navigateur s'ouvre trois secondes apres, le temps que le serveur demarre.
start "" /min cmd /c "timeout /t 3 >nul & start "" http://localhost:3000/"
call npm run dev
pause
