import type { Badge, Challenge } from '../types';

/**
 * Calculates the total cumulative XP of a user based on their current level and current XP.
 * For each level i from 1 to level - 1, the user required i * 200 XP to level up.
 */
export function calculateCumulativeXp(xp: number, level: number): number {
  let cumulativeXp = xp;
  for (let i = 1; i < level; i++) {
    cumulativeXp += i * 200;
  }
  return cumulativeXp;
}

/**
 * Checks if a specific badge should be unlocked.
 * @param badge The badge to check
 * @param cumulativeXp The user's total cumulative XP
 * @param challenges The current list of challenges
 */
export function checkBadgeUnlock(
  badge: Badge,
  cumulativeXp: number,
  challenges: Challenge[]
): boolean {
  if (badge.isUnlocked) return true;

  const rule = badge.unlockRule;

  if (rule.type === 'XP') {
    return cumulativeXp >= rule.value;
  }

  if (rule.type === 'ChallengeCount') {
    const completedChallenges = challenges.filter(c => 
      c.status === 'Completed' &&
      (!rule.category || c.category === rule.category)
    );
    return completedChallenges.length >= rule.value;
  }

  return false;
}

/**
 * Evaluates all badges and updates their unlocked state.
 * @returns The updated badges array and a boolean indicating if any badge was newly unlocked.
 */
export function evaluateBadgeUnlocks(
  badges: Badge[],
  xp: number,
  level: number,
  challenges: Challenge[]
): { updatedBadges: Badge[]; userBadgesUpdated: boolean } {
  const cumulativeXp = calculateCumulativeXp(xp, level);
  let userBadgesUpdated = false;

  const updatedBadges = badges.map(badge => {
    if (badge.isUnlocked) return badge;

    const shouldUnlock = checkBadgeUnlock(badge, cumulativeXp, challenges);
    if (shouldUnlock) {
      userBadgesUpdated = true;
      return {
        ...badge,
        isUnlocked: true,
        unlockedAt: new Date().toISOString().split('T')[0]
      };
    }

    return badge;
  });

  return { updatedBadges, userBadgesUpdated };
}
