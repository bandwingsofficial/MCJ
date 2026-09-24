/** Matches Admin Trainer list: persisted first + last name only. */
export function trainerDisplayNameFromParts(
  firstName: string,
  lastName?: string | null,
): string {
  return [firstName, lastName].filter(Boolean).join(" ");
}
