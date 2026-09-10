export const ASSESSMENT_TYPES = [
  "TEST",
  "PRESENTATION",
  "ASSIGNMENT",
  "PRACTICAL",
  "OTHER",
] as const;

export type AssessmentTypeValue = (typeof ASSESSMENT_TYPES)[number];

export const ASSESSMENT_REMARK_OPTIONS = [
  { label: "Excellent", value: "Excellent" },
  { label: "Very Good", value: "Very Good" },
  { label: "Good", value: "Good" },
  { label: "Satisfactory", value: "Satisfactory" },
  { label: "Needs Improvement", value: "Needs Improvement" },
  { label: "Absent", value: "Absent" },
] as const;
