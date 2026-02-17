export type UserType = 'porteur' | 'financeur' | 'admin';
export type SubscriptionStatus = 'active' | 'trial' | 'expired' | 'cancelled';
export type SubscriptionPlan = 'monthly' | 'annual';

export interface UserProfile {
  uid: string;
  email: string;
  userType: UserType;
  subscriptionStatus: SubscriptionStatus;
  subscriptionPlan: SubscriptionPlan | null;
  profileComplete: boolean;
  createdAt: Date;
}

export interface Aap {
  id: string;
  title: string;
  description: string;
  financeurId: string;
  financeurName: string;
  status: 'draft' | 'published' | 'closed' | 'archived';
  budgetMin?: number;
  budgetMax?: number;
  deadline: Date;
  sectorsTargeted: string[];
  territoriesEligible: string[];
  tags: string[];
  requiredDocuments: string[];
  views: number;
  applicationsCount: number;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Application {
  id: string;
  aapId: string;
  porteurId: string;
  financeurId: string;
  status: 'draft' | 'submitted' | 'under_review' | 'shortlisted' | 'accepted' | 'rejected';
  projectTitle: string;
  projectDescription: string;
  objectives: string;
  methodology: string;
  timeline: string;
  budget: {
    total: number;
    breakdown: { category: string; amount: number }[];
  };
  team: { name: string; role: string; expertise: string }[];
  expectedImpact: string;
  documents: { name: string; type: string; url: string }[];
  prequalificationScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'system' | 'new_aap' | 'status_change' | 'new_message' | 'deadline';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
}
