@echo off
rem Configuration de la boite d'envoi des courriels hebdomadaires (changement alertes-courriel, 2026-10-21).
rem Pose les questions une par une, ecrit scraping\.env (jamais commite), envoie un courriel de test.
chcp 65001 >nul
cd /d "%~dp0"
"..\.venv\Scripts\python.exe" configurer_courriel.py
echo.
pause
