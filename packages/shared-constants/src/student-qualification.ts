/**
 * Canonical student qualification choices for admin-web + customer-web.
 * Keep labels exact — they are persisted as Student.qualification strings.
 */
export const STUDENT_QUALIFICATION_OPTIONS = [
  "PUC / +2 (Commerce)",
  "B.Com – Bachelor of Commerce",
  "BBA / BBM – Business Administration / Management",
  "M.Com – Master of Commerce",
  "MBA – Finance & Management",
  "Other commerce-related UG & PG courses",
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
