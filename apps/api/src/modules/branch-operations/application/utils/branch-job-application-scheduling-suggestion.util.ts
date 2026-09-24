import {
  resolveJobApplicationSchedulingSuggestion,
  type ActiveInterviewRoundConfig,
  type JobApplicationSchedulingSuggestion,
} from '@mcj/shared-constants';

import type { BranchJobApplicationInterviewListRow } from './branch-job-application-interview-list.util';

export function serializeJobApplicationSchedulingSuggestion(
  suggestion: JobApplicationSchedulingSuggestion | null,
  activeRounds: ActiveInterviewRoundConfig[] = [],
) {
  if (!suggestion) return null;
  return {
    roundId: suggestion.roundId,
    roundName: suggestion.roundName,
    roundSortOrder:
      activeRounds.find((round) => round.id === suggestion.roundId)
        ?.sortOrder ?? null,
    waitingSince: new Date(suggestion.waitingSinceMs).toISOString(),
    waitingKind: suggestion.waitingKind,
    previousRoundName: suggestion.previousRoundName,
    previousRoundClearedAt: suggestion.previousRoundClearedAtMs
      ? new Date(suggestion.previousRoundClearedAtMs).toISOString()
      : null,
    scheduleActionLabel: suggestion.scheduleActionLabel,
  };
}

export function buildJobApplicationSchedulingSuggestion(input: {
  activeRounds: ActiveInterviewRoundConfig[];
  branchInterviews: BranchJobApplicationInterviewListRow[];
  applicationStatus: string;
  branchAssignedAt: Date | null;
}): JobApplicationSchedulingSuggestion | null {
  return resolveJobApplicationSchedulingSuggestion({
    activeRounds: input.activeRounds,
    branchAssignedAt: input.branchAssignedAt?.toISOString() ?? null,
    applicationStatus: input.applicationStatus,
    interviews: input.branchInterviews.map((item) => ({
      id: item.id,
      status: item.status,
      result: item.result,
      scheduledAt: item.scheduledAt,
      durationMinutes: item.durationMinutes,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      roundNumber: item.roundNumber,
      roundId: item.roundId,
      nextRoundId: item.nextRoundId,
      notes: item.notes,
      round: item.round,
      nextRound: item.nextRound,
    })),
  });
}
