"""Tests de la lecture des appels publiés en PDF (changement lecture-pdf-appels), sans réseau."""
import sys
from pathlib import Path

import httpx

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import extraction_locale  # noqa: E402
import lecture_pdf  # noqa: E402


def pdf_minimal(pages: list[str]) -> bytes:
    """Petit PDF valide, une ligne de texte par page (Helvetica), fabriqué sans bibliothèque."""
    n = len(pages)
    objets = [b"<< /Type /Catalog /Pages 2 0 R >>",
              f"<< /Type /Pages /Kids [{' '.join(f'{4 + 2 * i} 0 R' for i in range(n))}] /Count {n} >>".encode(),
              b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"]
    for i, texte in enumerate(pages):
        flux = f"BT /F1 12 Tf 72 712 Td ({texte}) Tj ET".encode("latin-1")
        objets.append(f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> "
                      f"/Contents {5 + 2 * i} 0 R >>".encode())
        objets.append(b"<< /Length %d >>\nstream\n" % len(flux) + flux + b"\nendstream")
    sortie, positions = b"%PDF-1.4\n", []
    for k, objet in enumerate(objets, 1):
        positions.append(len(sortie))
        sortie += f"{k} 0 obj\n".encode() + objet + b"\nendobj\n"
    xref = len(sortie)
    sortie += f"xref\n0 {len(objets) + 1}\n0000000000 65535 f \n".encode()
    sortie += b"".join(f"{p:010d} 00000 n \n".encode() for p in positions)
    sortie += f"trailer\n<< /Size {len(objets) + 1} /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF\n".encode()
    return sortie


def test_adresses_et_reponses_pdf():
    for oui in ["https://a.fr/cahier.PDF?v=2", "https://x.fr/telecharger?path=doc.pdf", "https://t.fr/f?file=a.pdf&cid=3"]:
        assert lecture_pdf.est_adresse_pdf(oui), oui
    for non in ["https://var.fr/aap-pdf", "https://n.ars.sante.fr/media/1/download?inline", "https://a.fr/page"]:
        assert not lecture_pdf.est_adresse_pdf(non), non
    assert lecture_pdf.est_reponse_pdf("application/pdf; charset=binary", b"")
    assert lecture_pdf.est_reponse_pdf("application/octet-stream", b"%PDF-1.7\n")
    assert not lecture_pdf.est_reponse_pdf("text/html", b"<html>")


def test_texte_pdf_borne_aux_pages_et_tolerant():
    donnees = pdf_minimal(["Appel a projets 2027", "Date limite 30 novembre 2026"])
    texte, pages = lecture_pdf.texte_pdf(donnees)
    assert pages == 2 and "Appel a projets 2027" in texte and "Date limite 30 novembre 2026" in texte
    texte, pages = lecture_pdf.texte_pdf(donnees, max_pages=1)
    assert pages == 2 and "Date limite" not in texte
    assert lecture_pdf.texte_pdf(b"pas un pdf") == ("", 0)


def test_telechargement_borne_et_controle():
    pdf = pdf_minimal(["Appel"])

    def repondre(requete):
        chemins = {"/a.pdf": (200, "application/pdf", pdf), "/page.pdf": (200, "text/html", b"<html>erreur</html>"),
                   "/gros.pdf": (200, "application/pdf", b"%PDF-" + b"0" * 2000)}
        code, type_contenu, corps = chemins.get(requete.url.path, (404, "text/html", b""))
        return httpx.Response(code, headers={"content-type": type_contenu}, content=corps)

    with httpx.Client(transport=httpx.MockTransport(repondre)) as client:
        assert lecture_pdf.telecharger_pdf("https://x.fr/a.pdf", client) == pdf
        assert lecture_pdf.telecharger_pdf("https://x.fr/page.pdf", client) is None  # page d'erreur déguisée
        assert lecture_pdf.telecharger_pdf("https://x.fr/absent.pdf", client) is None
        assert lecture_pdf.telecharger_pdf("https://x.fr/gros.pdf", client, max_octets=1000) is None


def test_liens_web_avec_pdf_sur_option():
    liens = [{"href": "https://a.fr/p1"}, {"href": "https://a.fr/cahier.PDF?v=2"}, {"href": "https://a.fr/annexe.docx"}]
    assert [l["href"] for l in extraction_locale.liens_web(liens, set())] == ["https://a.fr/p1"]
    assert [l["href"] for l in extraction_locale.liens_web(liens, set(), pdf=True)] == ["https://a.fr/p1", "https://a.fr/cahier.PDF?v=2"]
