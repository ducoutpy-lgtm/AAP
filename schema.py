"""Schema Pydantic cible pour un AAP normalise.

Toute source, quelle que soit sa structure, produit des objets AapNormalized.
C est ce schema que consommera le futur moteur de recherche / matching.
"""
from __future__ import annotations

from typing import Optional
from pydantic import BaseModel, Field


class FichierJoint(BaseModel):
    url: str
    filename: str
    local_path: Optional[str] = None


class AapNormalized(BaseModel):
    titre: str
    financeur: str
    description: str
    url_source: str

    date_ouverture: Optional[str] = None  # ISO YYYY-MM-DD
    date_cloture: Optional[str] = None

    montant_min: Optional[int] = None
    montant_max: Optional[int] = None
    enveloppe_globale: Optional[str] = None

    eligibilite: list[str] = Field(default_factory=list)
    pieces_attendues: list[str] = Field(default_factory=list)
    territoire: Optional[str] = None
    categories_etablissement: list[str] = Field(default_factory=list)

    fichiers_joints: list[FichierJoint] = Field(default_factory=list)
    scrape_metadata: dict = Field(default_factory=dict)
