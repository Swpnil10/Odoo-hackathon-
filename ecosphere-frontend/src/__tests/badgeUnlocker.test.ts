import { describe, it, expect } from 'vitest';
import { 
  calculateCumulativeXp, 
  checkBadgeUnlock, 
  evaluateBadgeUnlocks 
} from '../utils/badgeUnlocker';
import type { Badge, Challenge } from '../types';

describe('Badge auto-unlock and XP calculations', () => {
  
  describe('calculateCumulativeXp', () => {
    it('calculates cumulative XP correctly for Level 1', () => {
      // Level 1: user has just their current XP
      expect(calculateCumulativeXp(80, 1)).toBe(80);
    });

    it('calculates cumulative XP correctly for higher levels', () => {
      // Level 2: current XP + level 1 max XP threshold (1 * 200 = 200)
      expect(calculateCumulativeXp(50, 2)).toBe(250);

      // Level 3: current XP + level 1 threshold (200) + level 2 threshold (2 * 200 = 400) = XP + 600
      expect(calculateCumulativeXp(120, 3)).toBe(720);
    });
  });

  describe('checkBadgeUnlock', () => {
    const mockBadgeXP: Badge = {
      id: 'badge-xp-1',
      title: 'XP Badge',
      description: 'Unlock at 500 cumulative XP',
      icon: 'Sprout',
      unlockRule: { type: 'XP', value: 500 },
      isUnlocked: false
    };

    const mockBadgeChallenges: Badge = {
      id: 'badge-ch-1',
      title: 'Challenge Badge',
      description: 'Unlock after 2 Completed Environmental challenges',
      icon: 'Flame',
      unlockRule: { type: 'ChallengeCount', value: 2, category: 'Environmental' },
      isUnlocked: false
    };

    const mockBadgeSocialChallenges: Badge = {
      id: 'badge-ch-2',
      title: 'Social Challenge Badge',
      description: 'Unlock after 3 Social challenges',
      icon: 'Heart',
      unlockRule: { type: 'ChallengeCount', value: 3, category: 'Social' },
      isUnlocked: false
    };

    it('unlocks XP badge when threshold is met or exceeded', () => {
      expect(checkBadgeUnlock(mockBadgeXP, 499, [])).toBe(false);
      expect(checkBadgeUnlock(mockBadgeXP, 500, [])).toBe(true);
      expect(checkBadgeUnlock(mockBadgeXP, 600, [])).toBe(true);
    });

    it('unlocks ChallengeCount badges based on completed challenges in category', () => {
      const challenges: Challenge[] = [
        {
          id: '1', title: 'A', description: '', category: 'Environmental',
          xp: 10, points: 10, status: 'Completed', startDate: '', endDate: '', participantsCount: 1, proofRequired: false
        },
        {
          id: '2', title: 'B', description: '', category: 'Social',
          xp: 10, points: 10, status: 'Completed', startDate: '', endDate: '', participantsCount: 1, proofRequired: false
        },
        {
          id: '3', title: 'C', description: '', category: 'Environmental',
          xp: 10, points: 10, status: 'Completed', startDate: '', endDate: '', participantsCount: 1, proofRequired: false
        }
      ];

      // Env challenges completed count = 2. It meets environmental criteria (value: 2).
      expect(checkBadgeUnlock(mockBadgeChallenges, 0, challenges)).toBe(true);

      // Social challenges completed count = 1. Does not meet social criteria (value: 3).
      expect(checkBadgeUnlock(mockBadgeSocialChallenges, 0, challenges)).toBe(false);
    });
  });

  describe('evaluateBadgeUnlocks', () => {
    it('returns newly unlocked badges and sets userBadgesUpdated to true', () => {
      const badges: Badge[] = [
        {
          id: 'b-1', title: 'Green Horn', description: '', icon: '',
          unlockRule: { type: 'XP', value: 100 }, isUnlocked: false
        },
        {
          id: 'b-2', title: 'Eco Warrior', description: '', icon: '',
          unlockRule: { type: 'XP', value: 1000 }, isUnlocked: false
        }
      ];

      // Cumulative XP: Level 2 with 50 XP = 250 XP
      const { updatedBadges, userBadgesUpdated } = evaluateBadgeUnlocks(badges, 50, 2, []);

      expect(userBadgesUpdated).toBe(true);
      // b-1 should be unlocked because 250 >= 100
      expect(updatedBadges[0].isUnlocked).toBe(true);
      expect(updatedBadges[0].unlockedAt).toBeDefined();
      // b-2 should remain locked because 250 < 1000
      expect(updatedBadges[1].isUnlocked).toBe(false);
    });
  });
});
