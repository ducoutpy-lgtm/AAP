"""Dossier de candidature PDF de test (changement candidature-depuis-pdf, 2026-10-21).

Pourquoi : la session doit essayer la lecture d'un dossier sur les émulateurs sans dossier réel ; aucune bibliothèque
PDF n'est installée, le fichier est écrit à la main (PDF 1.4, une page, police Helvetica, texte ASCII sans accent).

Usage : python scripts/pdf_dossier_test.py  -> scripts/sauvegardes/dossier_test.pdf
"""
from __future__ import annotations

import sys
from pathlib import Path

LIGNES = [
    "DOSSIER DE CANDIDATURE - APPEL A PROJETS",
    "",
    "Structure candidate : EHPAD Les Lilas (association loi 1901), Evry-Courcouronnes (91)",
    "Titre du projet : Creation d'une unite de vie protegee de 14 places pour personnes",
    "atteintes de la maladie d'Alzheimer",
    "",
    "Resume : L'EHPAD Les Lilas accueille 84 residents. Le projet cree une unite de vie",
    "protegee de 14 places, avec un jardin therapeutique et une equipe formee a",
    "l'accompagnement des troubles cognitifs. Il repond a la demande croissante du",
    "territoire (liste d'attente de 31 personnes en 2026).",
    "",
    "Calendrier : travaux de mars 2027 a novembre 2027, ouverture en janvier 2028.",
    "",
    "Budget total du projet : 480 000 euros.",
    "Montant demande au financeur : 150 000 euros.",
    "Autofinancement : 130 000 euros. Autres financeurs sollicites : conseil departemental 200 000 euros.",
    "",
    "Equipe : directrice, medecin coordonnateur, cadre de sante, 6 aides-soignants formes.",
    "Contact : Camille Test, directrice, 01 23 45 67 89.",
]


def contenu_page(lignes: list[str]) -> bytes:
    corps = ["BT", "/F1 11 Tf", "50 790 Td", "14 TL"]
    for l in lignes:
        corps.append("(" + l.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)") + ") Tj T*")
    corps.append("ET")
    return "\n".join(corps).encode("latin-1")


def ecrire_pdf(chemin: Path, lignes: list[str]) -> None:
    flux = contenu_page(lignes)
    objets = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
        b"<< /Length " + str(len(flux)).encode() + b" >>\nstream\n" + flux + b"\nendstream",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    ]
    sortie = bytearray(b"%PDF-1.4\n")
    positions = []
    for i, obj in enumerate(objets, 1):
        positions.append(len(sortie))
        sortie += f"{i} 0 obj\n".encode() + obj + b"\nendobj\n"
    xref = len(sortie)
    sortie += f"xref\n0 {len(objets) + 1}\n0000000000 65535 f \n".encode()
    for p in positions:
        sortie += f"{p:010d} 00000 n \n".encode()
    sortie += f"trailer\n<< /Size {len(objets) + 1} /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF\n".encode()
    chemin.write_bytes(bytes(sortie))


def main() -> int:
    chemin = Path(__file__).resolve().parent / "sauvegardes" / "dossier_test.pdf"
    chemin.parent.mkdir(exist_ok=True)
    ecrire_pdf(chemin, LIGNES)
    print(f"{chemin} ({chemin.stat().st_size} octets)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
