/**
 * Canonical qualification choices for admin-web (students, trainers) + customer-web.
 * Keep labels exact — they are persisted as qualification strings in the database.
 */
export const STUDENT_QUALIFICATION_OPTIONS = [
  "PUC / +2 (Commerce)",
  "PUC / +2 (Science)",
  "PUC / +2 (Arts)",
  "Diploma",
  "B.Com – Bachelor of Commerce",
  "B.Com – Accounting & Finance",
  "B.Com – Banking & Finance",
  "B.Com – Computer Applications",
  "BBA / BBM – Business Administration / Management",
  "BMS – Bachelor of Management Studies",
  "M.Com – Master of Commerce",
  "M.Com – Accounting & Finance",
  "MBA – Finance & Management",
  "PGDM – Finance / Management",
  "Other Commerce-related UG & PG courses",
  "CA – Chartered Accountant",
  "CMA – Cost and Management Accountant",
  "CS – Company Secretary",
  "ACCA – Association of Chartered Certified Accountants",
  "CPA – Certified Public Accountant",
  "CFA – Chartered Financial Analyst",
  "CIMA – Chartered Institute of Management Accountants",
  "ICWA – Cost & Works Accountant",
  "Diploma in Accounting & Finance",
  "Diploma in Accounting & Taxation",
  "Certificate in Accounting / Finance",
  "Diploma in Taxation",
  "GST Certification",
  "Income Tax Certification",
  "Banking & Finance Certification",
  "Financial Planning Certification",
  "Investment / Stock Market Certification",
  "Other Finance-related qualifications",
  "BCA – Bachelor of Computer Applications",
  "MCA – Master of Computer Applications",
  "B.Sc Computer Science / IT",
  "M.Sc Computer Science / IT",
  "Diploma in Computer Applications",
  "Computer / IT Certification",
  "BA – Bachelor of Arts",
  "MA – Master of Arts",
  "B.Sc – Bachelor of Science",
  "M.Sc – Master of Science",
  "BE / B.Tech",
  "ME / M.Tech",
  "LLB – Bachelor of Laws",
  "LLM – Master of Laws",
  "PhD / Doctorate",
  "Other Bachelor's Degree",
  "Other Master's Degree",
  "Other Professional Qualification",
  "Other",
] as const;

export type StudentQualificationOption =
  (typeof STUDENT_QUALIFICATION_OPTIONS)[number];

export type StudentQualificationSelectOption = {
  label: string;
  value: string;
};

export function isStudentQualificationOption(
  value: string,
): value is StudentQualificationOption {
  return (STUDENT_QUALIFICATION_OPTIONS as readonly string[]).includes(value);
}

/**
 * Select options for forms. If a legacy saved value is not in the canonical
 * list, include it so the existing value remains visible and selectable.
 */
export function buildStudentQualificationSelectOptions(
  currentValue?: string | null,
): StudentQualificationSelectOption[] {
  const options: StudentQualificationSelectOption[] =
    STUDENT_QUALIFICATION_OPTIONS.map((value) => ({
      label: value,
      value,
    }));

  const trimmed = currentValue?.trim() ?? "";
  if (trimmed && !isStudentQualificationOption(trimmed)) {
    return [{ label: trimmed, value: trimmed }, ...options];
  }

  return options;
}
