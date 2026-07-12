import { describe, it, expect } from 'vitest';
import { calculateWeightedScores, calculateOverallESGScore } from '../utils/esgMath';
import type { DepartmentScore } from '../types';

describe('ESG Math Scoring calculations', () => {
  const mockDepts: DepartmentScore[] = [
    { id: '1', name: 'Engineering', environmental: 80, social: 70, governance: 90, employeeCount: 100 },
    { id: '2', name: 'Sales', environmental: 60, social: 80, governance: 70, employeeCount: 50 },
  ];

  it('calculates departmental weighted totals correctly', () => {
    // 50% Environmental, 30% Social, 20% Governance
    const weights = { environmental: 50, social: 30, governance: 20 };
    const calculated = calculateWeightedScores(mockDepts, weights);

    // Engineering: 80 * 0.5 + 70 * 0.3 + 90 * 0.2 = 40 + 21 + 18 = 79
    expect(calculated[0].weightedTotal).toBe(79);

    // Sales: 60 * 0.5 + 80 * 0.3 + 70 * 0.2 = 30 + 24 + 14 = 68
    expect(calculated[1].weightedTotal).toBe(68);
  });

  it('calculates company overall score with equal weights', () => {
    const calculatedDepts = [
      { weightedTotal: 80, employeeCount: 100 },
      { weightedTotal: 60, employeeCount: 50 },
    ];
    
    // Equal weighting overall rating: (80 + 60) / 2 = 70
    const score = calculateOverallESGScore(calculatedDepts, false);
    expect(score).toBe(70);
  });

  it('calculates company overall score weighted by employees count', () => {
    const calculatedDepts = [
      { weightedTotal: 80, employeeCount: 100 }, // 100 employees
      { weightedTotal: 50, employeeCount: 50 },  // 50 employees
    ];
    
    // Weighted overall rating: (80 * 100 + 50 * 50) / 150 = (8000 + 2500) / 150 = 10500 / 150 = 70
    const score = calculateOverallESGScore(calculatedDepts, true);
    expect(score).toBe(70);
  });

  it('handles empty department list gracefully', () => {
    expect(calculateOverallESGScore([], false)).toBe(0);
    expect(calculateOverallESGScore([], true)).toBe(0);
  });
});
