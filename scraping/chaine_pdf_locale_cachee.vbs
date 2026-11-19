' Chaine locale des PDF sans fenetre (changement lecture-pdf-locale, 2026-11-19), action de la tache planifiee
' « AAP Sante - lecture locale des PDF » du lundi 23 h, acceptee par Monsieur DUCOUT le 2026-11-19 (« Oui, lundi 23 h »).
Dim dossier
dossier = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
CreateObject("WScript.Shell").Run "cmd /c """ & dossier & "\chaine_pdf_locale.cmd""", 0, True
