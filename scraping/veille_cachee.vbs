' Veille hebdomadaire sans fenetre (changement veille-autonome, 2026-11-13).
' Pourquoi : le 9 novembre, la veille lancee par la tache planifiee a ete arretee pendant la collecte, sa fenetre ayant
' ete fermee (code -1073741510). Sans fenetre, on ne peut plus l'arreter par erreur ; le journal reste logs\veille.log.
' Usage, une fois accepte par Monsieur DUCOUT, comme action de la tache « AAP Sante - veille hebdomadaire » :
'   wscript.exe "<dossier du projet>\scraping\veille_cachee.vbs"
Dim dossier
dossier = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
CreateObject("WScript.Shell").Run "cmd /c """ & dossier & "\veille.cmd"" auto", 0, True
