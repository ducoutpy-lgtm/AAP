import { Timestamp } from 'firebase/firestore';

export type UserType = 'porteur' | 'financeur' | 'admin';
export type SubscriptionStatus = 'active' | 'trial' | 'expired' | 'cancelled';
export type SubscriptionPlan = 'monthly' | 'annual' | null;

export interface User {
  uid: string;
  email: string;
  userType: UserType;
  subscriptionStatus: SubscriptionStatus;
  subscriptionPlan: SubscriptionPlan;
  subscriptionId?: string;
  stripeCustomerId?: string;
  createdAt: Timestamp | Date;
  profileComplete: boolean;
  trialEndsAt?: Timestamp | Date | null;
  currentPeriodEnd?: Timestamp | Date;
  notificationPreferences?: NotificationPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  inApp: boolean;
  frequency: 'realtime' | 'daily' | 'weekly';
}

export interface PorteurProfile {
  userId: string;
  structureName: string;
  siret?: string;
  structureType: 'entreprise' | 'association' | 'collectivite' | 'laboratoire' | 'autre';
  secteurActivite: string;
  domainesIntervention: string[];
  address?: Address;
  contactPerson?: ContactPerson;
  teamSize?: number;
  website?: string;
  description?: string;
  updatedAt: Timestamp | Date;
}

export interface FinanceurProfile {
  userId: string;
  organisationName: string;
  organisationType: 'ministere' | 'agence' | 'fondation' | 'entreprise' | 'collectivite';
  sectorsSupported: string[];
  address?: Address;
  contactPerson?: ContactPerson;
  website?: string;
  logo?: string;
  description?: string;
  updatedAt: Timestamp | Date;
}

export interface Address {
  street?: string;
  city: string;
  postalCode: string;
  region: string;
  country: string;
}

export interface ContactPerson {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position?: string;
}

export type AapStatus = 'draft' | 'published' | 'closed' | 'archived';

export interface AAP {
  id?: string;
  financeurId: string;
  financeurName?: string;
  financeurLogo?: string;
  title: string;
  description: string;
  sectorsTargeted: string[];
  territoriesEligible: string[];
  structureTypeEligible?: string[];
  budgetMin?: number;
  budgetMax?: number;
  budgetTotal?: number;
  deadline: Timestamp | Date;
  publicationDate?: Timestamp | Date;
  startDate?: Timestamp | Date;
  endDate?: Timestamp | Date;
  eligibilityCriteria?: string;
  evaluationCriteria?: string;
  requiredDocuments?: string[];
  externalUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  tags?: string[];
  status: AapStatus;
  publishedAt?: Timestamp | Date;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  views?: number;
  applicationsCount?: number;
  source?: 'manual' | 'scraped';
}

export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'accepted'
  | 'rejected'
  | 'pending_info';

export interface Application {
  id?: string;
  aapId: string;
  aapTitle?: string;
  porteurId: string;
  porteurName?: string;
  financeurId: string;

  // Project information
  projectTitle: string;
  projectDescription: string;
  objectives: string;
  methodology: string;
  timeline: string;
  expectedImpact: string;

  // Budget
  budget: {
    total: number;
    breakdown: BudgetItem[];
  };

  // Team
  team: TeamMember[];

  // Partners
  partners?: Partner[];

  // Documents
  documents?: ApplicationDocument[];

  // Scores
  prequalificationScore?: number;
  completenessScore?: number;
  conformityScore?: number;
  qualityScore?: number;
  conformityFlags?: string[];
  suggestions?: string[];

  // Financeur evaluation
  financeurScore?: number;
  financeurNotes?: string;
  financeurComments?: string;

  // Status
  status: ApplicationStatus;
  statusHistory?: StatusChange[];

  // Metadata
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  submittedAt?: Timestamp | Date;
}

export interface BudgetItem {
  category: string;
  description?: string;
  amount: number;
}

export interface TeamMember {
  name: string;
  role: string;
  expertise: string;
  email?: string;
}

export interface Partner {
  name: string;
  type: string;
  contribution: string;
}

export interface ApplicationDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  uploadedAt: Timestamp | Date;
}

export interface StatusChange {
  status: ApplicationStatus;
  changedBy: string;
  changedAt: Timestamp | Date;
  comment?: string;
}

export interface SavedSearch {
  id?: string;
  userId: string;
  name: string;
  filters: SearchFilters;
  alertEnabled: boolean;
  alertFrequency?: 'realtime' | 'daily' | 'weekly';
  createdAt: Timestamp | Date;
  lastExecutedAt?: Timestamp | Date;
}

export interface SearchFilters {
  keywords?: string;
  sectors?: string[];
  territories?: string[];
  budgetMin?: number;
  budgetMax?: number;
  deadlineAfter?: Date;
  deadlineBefore?: Date;
  structureTypes?: string[];
}

export interface FavoriteAap {
  id?: string;
  userId: string;
  aapId: string;
  savedAt: Timestamp | Date;
}

export type NotificationType =
  | 'system'
  | 'new_aap'
  | 'deadline'
  | 'status_change'
  | 'new_message';

export interface Notification {
  id?: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  relatedEntityId?: string;
  relatedEntityType?: 'aap' | 'application' | 'message';
  actionUrl?: string;
  createdAt: Timestamp | Date;
}

export interface Message {
  id?: string;
  applicationId: string;
  senderId: string;
  senderName: string;
  senderType: UserType;
  receiverId: string;
  content: string;
  attachments?: MessageAttachment[];
  read: boolean;
  createdAt: Timestamp | Date;
}

export interface MessageAttachment {
  name: string;
  url: string;
  size: number;
}

export interface Payment {
  id?: string;
  userId: string;
  stripePaymentId?: string;
  stripeSubscriptionId?: string;
  amount: number;
  currency: string;
  plan: 'monthly' | 'annual';
  status: 'succeeded' | 'failed' | 'pending';
  invoiceUrl?: string;
  paidAt?: Timestamp | Date;
  periodStart: Timestamp | Date;
  periodEnd: Timestamp | Date;
}

export interface Analytics {
  id?: string;
  date: Timestamp | Date;
  totalUsers: number;
  totalPorteurs: number;
  totalFinanceurs: number;
  totalAap: number;
  totalApplications: number;
  activeSubscriptions: number;
  trialUsers: number;
  revenue: number;
}
