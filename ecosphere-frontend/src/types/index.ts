export type ESGCategory = 'Environmental' | 'Social' | 'Governance';

export type ChallengeStatus = 'Draft' | 'Active' | 'Under Review' | 'Completed' | 'Archived';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: ESGCategory;
  xp: number;
  points: number;
  status: ChallengeStatus;
  proofRequired: boolean;
  proofSubmitted?: string;
  rejectionNote?: string;
  startDate: string;
  endDate: string;
  participantsCount: number;
}

export type UserRole = 'employee' | 'admin';

export interface DepartmentScore {
  id: string;
  name: string;
  environmental: number; // 0-100
  social: number;        // 0-100
  governance: number;    // 0-100
  employeeCount: number;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  pointsRequired: number;
  stock: number;
  category: 'Physical' | 'Digital' | 'Experience';
  icon: string; // Lucide icon string
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockRule: {
    type: 'XP' | 'ChallengeCount';
    value: number;
    category?: ESGCategory; // e.g. "Complete 3 Social challenges"
  };
  isUnlocked: boolean;
  unlockedAt?: string;
}

export interface UserProfile {
  name: string;
  role: string;
  department: string;
  xp: number;
  points: number;
  level: number;
  badges: string[]; // Badge IDs
}

export interface ESGWeightConfig {
  environmental: number; // e.g. 0.40
  social: number;        // e.g. 0.30
  governance: number;    // e.g. 0.30
}

export interface ReportFilter {
  department: string;
  startDate: string;
  endDate: string;
  module: string;
  employee: string;
  challenge: string;
  category: string;
}
