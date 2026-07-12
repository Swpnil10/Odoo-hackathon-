import type { Challenge, DepartmentScore, Reward, Badge, UserProfile } from '../types';

// NOTE FOR BACKEND DEVELOPERS:
// This file acts as the mock data layer. To integrate with a real backend API:
// 1. Replace these static structures with calls to your endpoints (e.g., fetch('/api/challenges')).
// 2. Wrap state updating functions in React Context or a state management library (Zustand/Redux).
// 3. Keep the TypeScript interfaces from 'src/types/index.ts' consistent to avoid frontend breaks.

export const initialUser: UserProfile = {
  name: 'Jane Doe',
  role: 'Sustainability Specialist',
  department: 'Operations',
  xp: 320, // Starting at Level 3
  points: 450,
  level: 3,
  badges: ['badge-1', 'badge-2']
};

export const mockChallenges: Challenge[] = [
  {
    id: 'ch-1',
    title: 'Zero Waste Coffee Week',
    description: 'Use reusable mugs for all hot drinks for 7 days. Help eliminate single-use paper cups.',
    category: 'Environmental',
    xp: 50,
    points: 100,
    status: 'Active',
    proofRequired: true,
    startDate: '2026-07-01',
    endDate: '2026-07-15',
    participantsCount: 38
  },
  {
    id: 'ch-2',
    title: 'Commute Green Challenge',
    description: 'Walk, cycle, carpool, or take public transit to the office at least 3 times this week.',
    category: 'Environmental',
    xp: 80,
    points: 150,
    status: 'Active',
    proofRequired: true,
    startDate: '2026-07-10',
    endDate: '2026-07-20',
    participantsCount: 24
  },
  {
    id: 'ch-3',
    title: 'Digital Declutter Audit',
    description: 'Delete 10GB of old files/emails to reduce server carbon footprint. A simple but effective change.',
    category: 'Environmental',
    xp: 30,
    points: 50,
    status: 'Active',
    proofRequired: false,
    startDate: '2026-07-05',
    endDate: '2026-07-18',
    participantsCount: 52
  },
  {
    id: 'ch-4',
    title: 'Diversity & Inclusion Session',
    description: 'Participate in the quarterly workshop on workplace empathy and gender equality.',
    category: 'Social',
    xp: 60,
    points: 120,
    status: 'Active',
    proofRequired: false,
    startDate: '2026-07-11',
    endDate: '2026-07-14',
    participantsCount: 15
  },
  {
    id: 'ch-5',
    title: 'Volunteer at Local Food Bank',
    description: 'Spend 3 hours volunteering at the community kitchen. Requires manager approval.',
    category: 'Social',
    xp: 120,
    points: 250,
    status: 'Under Review',
    proofRequired: true,
    proofSubmitted: 'Uploaded: receipt_signature_foodbank.pdf (Awaiting HR Verification)',
    startDate: '2026-07-01',
    endDate: '2026-07-10',
    participantsCount: 8
  },
  {
    id: 'ch-6',
    title: 'Governance Ethics Training',
    description: 'Complete the mandatory anti-bribery and compliance module on our Learning Management System.',
    category: 'Governance',
    xp: 100,
    points: 200,
    status: 'Completed',
    proofRequired: true,
    proofSubmitted: 'Auto-verified: Course completion certificate hash #9218F',
    startDate: '2026-06-15',
    endDate: '2026-06-30',
    participantsCount: 140
  },
  {
    id: 'ch-7',
    title: 'Carbon Neutrality Proposal',
    description: 'Draft a checklist of 5 policies to reduce departmental plastic use.',
    category: 'Environmental',
    xp: 40,
    points: 80,
    status: 'Draft',
    proofRequired: true,
    startDate: '2026-08-01',
    endDate: '2026-08-10',
    participantsCount: 0
  },
  {
    id: 'ch-8',
    title: 'Whistleblower Policy Check',
    description: 'Ensure audit protocols align with updated regional protection standards.',
    category: 'Governance',
    xp: 75,
    points: 150,
    status: 'Archived',
    proofRequired: false,
    startDate: '2026-05-01',
    endDate: '2026-05-15',
    participantsCount: 4
  }
];

export const mockDepartmentScores: DepartmentScore[] = [
  { id: 'dept-1', name: 'Engineering', environmental: 84, social: 76, governance: 90, employeeCount: 120 },
  { id: 'dept-2', name: 'Sales & Marketing', environmental: 62, social: 88, governance: 72, employeeCount: 85 },
  { id: 'dept-3', name: 'Operations', environmental: 78, social: 65, governance: 82, employeeCount: 50 },
  { id: 'dept-4', name: 'Human Resources', environmental: 70, social: 92, governance: 88, employeeCount: 30 },
  { id: 'dept-5', name: 'Finance & Legal', environmental: 55, social: 72, governance: 96, employeeCount: 25 }
];

export const mockRewards: Reward[] = [
  {
    id: 'rew-1',
    title: 'Plant a Dedicated Tree',
    description: 'Partner with OneTreePlanted to grow a tree in your name. You receive digital coordinates.',
    pointsRequired: 150,
    stock: 45,
    category: 'Digital',
    icon: 'Trees'
  },
  {
    id: 'rew-2',
    title: 'Premium Glass Eco Bottle',
    description: 'Double-walled glass sports bottle wrapped in sustainable bamboo. Fits cup holders.',
    pointsRequired: 200,
    stock: 8,
    category: 'Physical',
    icon: 'GlassWater'
  },
  {
    id: 'rew-3',
    title: 'Lunch with Sustainability CEO',
    description: '1-on-1 virtual mentoring session with our advisory board chairperson.',
    pointsRequired: 500,
    stock: 2,
    category: 'Experience',
    icon: 'Coffee'
  },
  {
    id: 'rew-4',
    title: '1-Month Bike Share Pass',
    description: 'Get free, unlimited 30-minute rides on the city bike share system for a month.',
    pointsRequired: 300,
    stock: 15,
    category: 'Experience',
    icon: 'Bike'
  },
  {
    id: 'rew-5',
    title: 'Solar Phone Charger',
    description: 'High-efficiency portable solar power bank to charge your devices on the go.',
    pointsRequired: 400,
    stock: 0, // Out of stock
    category: 'Physical',
    icon: 'Sun'
  }
];

export const mockBadges: Badge[] = [
  {
    id: 'badge-1',
    title: 'Green Seedling',
    description: 'Awarded for starting your sustainability journey.',
    icon: 'Sprout',
    unlockRule: { type: 'XP', value: 50 },
    isUnlocked: true,
    unlockedAt: '2026-06-10'
  },
  {
    id: 'badge-2',
    title: 'Eco Warrior',
    description: 'Completed at least 3 Environmental challenges.',
    icon: 'Flame',
    unlockRule: { type: 'ChallengeCount', value: 3, category: 'Environmental' },
    isUnlocked: true,
    unlockedAt: '2026-06-25'
  },
  {
    id: 'badge-3',
    title: 'Community Pillar',
    description: 'Completed 5 Social challenges.',
    icon: 'HeartHandshake',
    unlockRule: { type: 'ChallengeCount', value: 5, category: 'Social' },
    isUnlocked: false
  },
  {
    id: 'badge-4',
    title: 'Governance Guru',
    description: 'Reach 500 XP to prove compliance and policy mastery.',
    icon: 'ShieldAlert',
    unlockRule: { type: 'XP', value: 500 },
    isUnlocked: false
  }
];

// Helper options for the Custom Report Builder filters
export const filterMetadata = {
  departments: ['Engineering', 'Sales & Marketing', 'Operations', 'Human Resources', 'Finance & Legal'],
  modules: ['Gamification', 'Carbon Auditing', 'Supplier ESG Compliance', 'Policy Training'],
  employees: ['Jane Doe', 'John Smith', 'Sarah Jenkins', 'Michael Chang', 'Emily Watson'],
  categories: ['Environmental', 'Social', 'Governance']
};
