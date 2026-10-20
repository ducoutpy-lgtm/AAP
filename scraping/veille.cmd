@echo off
rem Veille hebdomadaire des appels (changement rejeu-collecte-veille, 2026-10-20) : relit les pages validees des
rem rubriques confirmees, collecte le texte des liens nouveaux, marque les fiches, ecrit VEILLE.md, puis affiche le
rem devis d'extraction des textes nouveaux SANS lancer aucun appel payant. L'extraction se lance ensuite a la main,
rem apres accord : ..\.venv\Scripts\python extraction_locale.py --extraire --moteur api
rem Zero euro tant que cette fenetre tourne. Fermer la fenetre arrete la veille (reprise possible, rien n'est perdu).
chcp 65001 >nul
cd /d "%~dp0"
echo Veille AAP Sante : relecture des pages validees (une page a la fois, deux secondes de pause). Zero euro.
echo.
"..\.venv\Scripts\python.exe" rejeu.py --relire --collecter --marquer --rapport
echo.
echo Devis d'extraction des textes nouveaux (aucun appel n'est lance ici) :
"..\.venv\Scripts\python.exe" extraction_locale.py --extraire --moteur api --dry-run
echo.
echo Rapport : VEILLE.md. Pour extraire les textes nouveaux apres accord :
echo   ..\.venv\Scripts\python extraction_locale.py --extraire --moteur api
pause
