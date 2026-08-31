import { AssessmentType } from '@prisma/client';

import {
  assessmentPercentage,
  averagePercentageByType,
  summarizeAssessmentMarks,
} from './assessment-analytics.util';

describe('assessment-analytics.util', () => {
  it('calculates percentage rounded to one decimal', () => {
    expect(assessmentPercentage(85, 100)).toBe(85);
    expect(assessmentPercentage(1, 3)).toBe(33.3);
  });

  it('summarizes assessment marks', () => {
    const summary = summarizeAssessmentMarks([
      {
        type: AssessmentType.TEST,
        maxMarks: 100,
        obtainedMarks: 80,
      },
      {
        type: AssessmentType.TEST,
        maxMarks: 100,
        obtainedMarks: 60,
      },
    ]);

    expect(summary.totalAssessments).toBe(2);
    expect(summary.averageMarks).toBe(70);
    expect(summary.averagePercentage).toBe(70);
    expect(summary.highestMarks).toBe(80);
    expect(summary.lowestMarks).toBe(60);
  });

  it('returns null averages for missing assessment types', () => {
    const byType = averagePercentageByType([
      {
        type: AssessmentType.TEST,
        maxMarks: 100,
        obtainedMarks: 50,
      },
    ]);

    expect(byType.TEST).toBe(50);
    expect(byType.ASSIGNMENT).toBeNull();
  });
});
