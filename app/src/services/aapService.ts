import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  increment,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { AAP, AapStatus } from '../types';

export interface CreateAapData {
  title: string;
  description: string;
  sectorsTargeted: string[];
  territoriesEligible: string[];
  structureTypeEligible?: string[];
  budgetMin?: number;
  budgetMax?: number;
  budgetTotal?: number;
  deadline: Date;
  publicationDate?: Date;
  startDate?: Date;
  endDate?: Date;
  eligibilityCriteria?: string;
  evaluationCriteria?: string;
  requiredDocuments?: string[];
  externalUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  tags?: string[];
}

export const aapService = {
  // Créer un AAP
  async createAap(financeurId: string, financeurName: string, data: CreateAapData): Promise<string> {
    const aapData: Omit<AAP, 'id'> = {
      ...data,
      financeurId,
      financeurName,
      deadline: Timestamp.fromDate(data.deadline),
      publicationDate: data.publicationDate ? Timestamp.fromDate(data.publicationDate) : undefined,
      startDate: data.startDate ? Timestamp.fromDate(data.startDate) : undefined,
      endDate: data.endDate ? Timestamp.fromDate(data.endDate) : undefined,
      status: 'draft',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      views: 0,
      applicationsCount: 0,
      source: 'manual',
    };

    const docRef = await addDoc(collection(db, 'aap'), aapData);
    return docRef.id;
  },

  // Récupérer un AAP par ID
  async getAapById(aapId: string): Promise<AAP | null> {
    const aapDoc = await getDoc(doc(db, 'aap', aapId));
    if (!aapDoc.exists()) return null;

    return { id: aapDoc.id, ...aapDoc.data() } as AAP;
  },

  // Récupérer tous les AAP d'un financeur
  async getFinanceurAaps(financeurId: string): Promise<AAP[]> {
    const q = query(
      collection(db, 'aap'),
      where('financeurId', '==', financeurId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AAP));
  },

  // Récupérer les AAP publiés (pour la recherche)
  async getPublishedAaps(limitCount: number = 20): Promise<AAP[]> {
    const q = query(
      collection(db, 'aap'),
      where('status', '==', 'published'),
      orderBy('publishedAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AAP));
  },

  // Mettre à jour un AAP
  async updateAap(aapId: string, data: Partial<CreateAapData>): Promise<void> {
    const updateData: any = {
      ...data,
      updatedAt: Timestamp.now(),
    };

    if (data.deadline) {
      updateData.deadline = Timestamp.fromDate(data.deadline);
    }
    if (data.publicationDate) {
      updateData.publicationDate = Timestamp.fromDate(data.publicationDate);
    }
    if (data.startDate) {
      updateData.startDate = Timestamp.fromDate(data.startDate);
    }
    if (data.endDate) {
      updateData.endDate = Timestamp.fromDate(data.endDate);
    }

    await updateDoc(doc(db, 'aap', aapId), updateData);
  },

  // Publier un AAP
  async publishAap(aapId: string): Promise<void> {
    await updateDoc(doc(db, 'aap', aapId), {
      status: 'published',
      publishedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  },

  // Changer le statut d'un AAP
  async updateAapStatus(aapId: string, status: AapStatus): Promise<void> {
    const updateData: any = {
      status,
      updatedAt: Timestamp.now(),
    };

    if (status === 'published') {
      updateData.publishedAt = Timestamp.now();
    }

    await updateDoc(doc(db, 'aap', aapId), updateData);
  },

  // Supprimer un AAP
  async deleteAap(aapId: string): Promise<void> {
    await deleteDoc(doc(db, 'aap', aapId));
  },

  // Incrémenter le nombre de vues
  async incrementViews(aapId: string): Promise<void> {
    await updateDoc(doc(db, 'aap', aapId), {
      views: increment(1),
    });
  },

  // Upload d'un document pour un AAP
  async uploadDocument(aapId: string, file: File): Promise<string> {
    const storageRef = ref(storage, `uploads/aap-documents/${aapId}/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
  },

  // Supprimer un document
  async deleteDocument(documentUrl: string): Promise<void> {
    const storageRef = ref(storage, documentUrl);
    await deleteObject(storageRef);
  },

  // Rechercher des AAP avec filtres
  async searchAaps(filters: {
    sectors?: string[];
    territories?: string[];
    budgetMin?: number;
    budgetMax?: number;
  }): Promise<AAP[]> {
    let q = query(
      collection(db, 'aap'),
      where('status', '==', 'published'),
      orderBy('publishedAt', 'desc')
    );

    // Note: Firestore a des limitations sur les requêtes complexes
    // Pour une recherche plus avancée, il faudrait utiliser Algolia ou Elasticsearch

    const snapshot = await getDocs(q);
    let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AAP));

    // Filtrage côté client pour les critères complexes
    if (filters.sectors && filters.sectors.length > 0) {
      results = results.filter(aap =>
        aap.sectorsTargeted.some(sector => filters.sectors!.includes(sector))
      );
    }

    if (filters.territories && filters.territories.length > 0) {
      results = results.filter(aap =>
        aap.territoriesEligible.some(territory => filters.territories!.includes(territory))
      );
    }

    if (filters.budgetMin !== undefined) {
      results = results.filter(aap =>
        aap.budgetMax === undefined || aap.budgetMax >= filters.budgetMin!
      );
    }

    if (filters.budgetMax !== undefined) {
      results = results.filter(aap =>
        aap.budgetMin === undefined || aap.budgetMin <= filters.budgetMax!
      );
    }

    return results;
  },
};
