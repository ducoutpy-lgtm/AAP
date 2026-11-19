@echo off
rem Chaine locale des PDF, chaque lundi a 23 h (changement lecture-pdf-locale, voie A « tout local » du 2026-11-19).
rem La veille de 8 h collecte les PDF sans les extraire ; ici tout se fait avec le modele local (Ollama, qwen3:8b), a
rem zero euro : extraction des PDF (question du champ comprise), controle, qualification, import en « a valider »,
rem puis tri de la file. Journal : logs\chaine_pdf_locale.log.
chcp 65001 >nul
set PYTHONUTF8=1
cd /d "%~dp0"
if /i not "%~1"=="sanspause" (
  call "%~f0" sanspause >> "logs\chaine_pdf_locale.log" 2>&1
  exit /b
)
echo Chaine locale des PDF : debut %date% %time%
rem Demarre le serveur Ollama s'il ne tourne pas (la commande list le lance)
"%LOCALAPPDATA%\Programs\Ollama\ollama.exe" list >nul 2>&1
rem Etapes et demande de rester eveille : chaine_pdf_locale.py
"..\.venv\Scripts\python.exe" chaine_pdf_locale.py
echo Chaine locale des PDF terminee le %date% %time%.
