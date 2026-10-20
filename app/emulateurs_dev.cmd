@echo off
rem Application AAP Sante sur les emulateurs Firebase (changement emulateurs-parcours-connectes, 2026-10-20).
rem Pourquoi : la session Claude Code ne se connecte jamais au vrai projet Firebase ; ici comptes, base et stockage
rem sont factices, sur ce PC seulement, ce qui permet de jouer les parcours connectes avec des comptes de test.
rem Demarre les emulateurs (comptes 9099, base 8080, stockage 9199, console http://localhost:4000) puis le serveur
rem de l'application en mode emulateurs sur http://localhost:3001. Fermer cette fenetre arrete tout.
rem Prerequis : JDK 21 (la CLI Firebase refuse Java 11) ; chemin ci-dessous a adapter si la version change.
chcp 65001 >nul
cd /d "%~dp0"
set "PATH=C:\Program Files\Eclipse Adoptium\jdk-21.0.12.101-hotspot\bin;%PATH%"
if not exist emulateurs\donnees mkdir emulateurs\donnees
start "Emulateurs Firebase (demo-aap)" cmd /c "firebase emulators:start --only auth,firestore,storage --project demo-aap --import emulateurs\donnees --export-on-exit"
echo Emulateurs en cours de demarrage (fenetre separee). Comptes de test : voir scripts\semer_emulateurs.py
echo Application sur http://localhost:3001 dans quelques secondes.
call npm run dev:emulateurs
