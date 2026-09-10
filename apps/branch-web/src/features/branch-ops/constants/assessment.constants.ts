export const ASSESSMENT_TYPES = [
  "TEST",
  "PRESENTATION",
  "ASSIGNMENT",
  "PRACTICAL",
  "OTHER",
] as const;

export type AssessmentTypeValue = (typeof ASSESSMENT_TYPES)[number];

export const ASSESSMENT_TYPE_BADGE_STYLES: Record<string, string> = {
  TEST: "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]",
  PRESENTATION: "bg-[#F5F3FF] text-[#6D28D9] border-[#DDD6FE]",
  ASSIGNMENT: "bg-[#F0FDFA] text-[#0F766E] border-[#99F6E4]",
  PRACTICAL: "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]",
  QUIZ: "bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]",
  OTHER: "bg-[#F8FAFC] text-[#475569] border-[#E2E8F0]",
};

export function getAssessmentTypeBadgeClass(type: string): string {
  const normalized = type.trim().toUpperCase();
  return (
    ASSESSMENT_TYPE_BADGE_STYLES[normalized] ??
    ASSESSMENT_TYPE_BADGE_STYLES.OTHER
  );
}

export const ASSESSMENT_REMARK_OPTIONS = [
  { label: "Excellent", value: "Excellent" },
  { label: "Very Good", value: "Very Good" },
  { label: "Good", value: "Good" },
  { label: "Satisfactory", value: "Satisfactory" },
  { label: "Needs Improvement", value: "Needs Improvement" },
  { label: "Absent", value: "Absent" },
] as const;
