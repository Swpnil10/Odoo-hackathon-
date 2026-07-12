import type { DepartmentScore, ESGWeightConfig } from '../types';

/**
 * Calculates the weighted score for each department based on the given ESG category weights.
 * @param departments List of department scores
 * @param weights Configured weights for Environmental, Social, and Governance (summing to 100)
 */
export function calculateWeightedScores<T extends DepartmentScore>(
  departments: T[],
  weights: ESGWeightConfig
): Array<T & { weightedTotal: number }> {
  return departments.map(d => {
    const weightedScore = (
      (d.environmental * weights.environmental) + 
      (d.social * weights.social) + 
      (d.governance * weights.governance)
    ) / 100;
    
    return {
      ...d,
      weightedTotal: Math.round(weightedScore)
    };
  });
}

/**
 * Calculates the company-wide overall ESG score.
 * @param calculatedDepts List of departments with their weightedTotal score computed
 * @param weightByEmployees Whether to weight the final average by employee counts
 */
export function calculateOverallESGScore(
  calculatedDepts: Array<{ weightedTotal: number; employeeCount: number }>,
  weightByEmployees: boolean
): number {
  if (calculatedDepts.length === 0) return 0;

  if (weightByEmployees) {
    const totalEmployees = calculatedDepts.reduce((sum, d) => sum + d.employeeCount, 0);
    const weightedSum = calculatedDepts.reduce((sum, d) => sum + (d.weightedTotal * d.employeeCount), 0);
    return totalEmployees > 0 ? Math.round(weightedSum / totalEmployees) : 0;
  } else {
    const sum = calculatedDepts.reduce((acc, d) => acc + d.weightedTotal, 0);
    return Math.round(sum / calculatedDepts.length);
  }
}
