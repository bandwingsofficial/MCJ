export const STUDENT_SELECT_ALL = "ALL";

export function uniqueSelectOptions<T extends { label: string; value: string }>(
  options: T[],
): T[] {
  const seen = new Set<string>();

  return options.filter((option) => {
    const value = option.value.trim();

    if (!value || seen.has(value)) {
      return false;
    }

    seen.add(value);
    return true;
  });
}
