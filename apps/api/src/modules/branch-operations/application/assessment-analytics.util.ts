import { AssessmentType } from '@prisma/client';

const ASSESSMENT_TYPES: AssessmentType[] = [
  AssessmentType.TEST,
  AssessmentType.PRESENTATION,
  AssessmentType.ASSIGNMENT,
  AssessmentType.PRACTICAL,
  AssessmentType.OTHER,
];

export interface AssessmentMarkRow {
  type: AssessmentType;
  maxMarks: number;
  obtainedMarks: number;
}

export function assessmentPercentage(
  obtainedMarks: number,
  maxMarks: number,
): number {
  if (maxMarks <= 0) return 0;
  return Math.round((obtainedMarks / maxMarks) * 1000) / 10;
}

export function summarizeAssessmentMarks(rows: AssessmentMarkRow[]) {
  if (!rows.length) {
    return {
      totalAssessments: 0,
      marksEntered: 0,
      averageMarks: 0,
      averagePercentage: 0,
      highestMarks: 0,
      lowestMarks: 0,
    };
  }

  const obtained = rows.map((row) => row.obtainedMarks);
  const sumObtained = obtained.reduce((acc, value) => acc + value, 0);
  const percentages = rows.map((row) =>
    assessmentPercentage(row.obtainedMarks, row.maxMarks),
  );

  return {
    totalAssessments: rows.length,
    marksEntered: rows.length,
    averageMarks: Math.round((sumObtained / rows.length) * 100) / 100,
    averagePercentage:
      Math.round(
        (percentages.reduce((acc, value) => acc + value, 0) /
          percentages.length) *
          10,
      ) / 10,
    highestMarks: Math.max(...obtained),
    lowestMarks: Math.min(...obtained),
  };
}

export function averagePercentageByType(
  rows: AssessmentMarkRow[],
): Record<AssessmentType, number | null> {
  const result = {} as Record<AssessmentType, number | null>;
  for (const type of ASSESSMENT_TYPES) {
    const typed = rows.filter((row) => row.type === type);
    if (!typed.length) {
      result[type] = null;
      continue;
    }
    const sum = typed.reduce(
      (acc, row) => acc + assessmentPercentage(row.obtainedMarks, row.maxMarks),
      0,
    );
    result[type] = Math.round((sum / typed.length) * 10) / 10;
  }
  return result;
}
