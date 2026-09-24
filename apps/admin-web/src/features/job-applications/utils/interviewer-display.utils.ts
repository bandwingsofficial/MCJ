export type InterviewerNameSource = {
  firstName: string;
  lastName?: string | null;
  email?: string | null;
  linkedTrainer?: {
    firstName: string;
    lastName?: string | null;
  } | null;
};

/** Canonical trainer/user name for Job Applications (no role suffixes). */
export function formatCanonicalInterviewerName(
  interviewer?: InterviewerNameSource | null,
  fallback = "—",
): string {
  if (!interviewer) {
    return fallback;
  }

  const trainer = interviewer.linkedTrainer;
  const firstName = (trainer?.firstName ?? interviewer.firstName).trim();
  const lastName = (trainer?.lastName ?? interviewer.lastName)?.trim() || null;
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

  return fullName || interviewer.email?.trim() || fallback;
}
