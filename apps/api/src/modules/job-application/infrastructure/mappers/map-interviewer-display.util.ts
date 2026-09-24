/** BranchUser on Interview — use linked Trainer as canonical name when present. */
export function mapInterviewerDisplayName(
  interviewer: {
    id: string;
    firstName: string;
    lastName: string | null;
    email: string;
    linkedTrainer?: {
      firstName: string;
      lastName: string | null;
    } | null;
  } | null,
): {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
} | null {
  if (!interviewer) {
    return null;
  }

  const trainer = interviewer.linkedTrainer;
  if (trainer) {
    return {
      id: interviewer.id,
      firstName: trainer.firstName.trim(),
      lastName: trainer.lastName?.trim() || null,
      email: interviewer.email,
    };
  }

  return {
    id: interviewer.id,
    firstName: interviewer.firstName.trim(),
    lastName: interviewer.lastName?.trim() || null,
    email: interviewer.email,
  };
}

/** Full display label from BranchUser (+ linked Trainer when present). */
export function formatInterviewerDisplayLabel(
  interviewer: Parameters<typeof mapInterviewerDisplayName>[0],
): string {
  const mapped = mapInterviewerDisplayName(interviewer);
  if (!mapped) {
    return '';
  }
  return (
    [mapped.firstName, mapped.lastName].filter(Boolean).join(' ').trim() ||
    mapped.email
  );
}

export const jobApplicationInterviewerSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  linkedTrainer: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  },
} as const;
