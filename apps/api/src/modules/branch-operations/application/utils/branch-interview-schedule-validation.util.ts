import {
  InterviewResult,
  InterviewRoundStatus,
  InterviewStatus,
} from '@prisma/client';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

import { resolveJobApplicationSchedulingSuggestion } from '@mcj/shared-constants';

import type { BranchJobApplicationInterviewListRow } from './branch-job-application-interview-list.util';
import { resolveBranchAssignedAt } from './branch-job-application-assignment.util';

const SCHEDULE_EPOCH_GUARD = Date.parse('1970-01-02T00:00:00.000Z');

function hasPersistedSchedule(scheduledAt: Date | null): boolean {
  if (!scheduledAt) return false;
  return scheduledAt.getTime() > SCHEDULE_EPOCH_GUARD;
}

export function mapInterviewsToSchedulingTimeline(
  interviews: BranchJobApplicationInterviewListRow[],
) {
  return interviews.map((item) => ({
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
  }));
}

export function resolveSchedulingEligibleFromMs(input: {
  branchInterviews: BranchJobApplicationInterviewListRow[];
  applicationStatus: string;
  branchAssignedAt: Date | null;
  activeRounds: Array<{
    id: string;
    name: string;
    sortOrder: number;
    status: InterviewRoundStatus;
  }>;
}): number | null {
  const suggestion = resolveJobApplicationSchedulingSuggestion({
    activeRounds: input.activeRounds,
    interviews: mapInterviewsToSchedulingTimeline(input.branchInterviews),
    applicationStatus: input.applicationStatus,
    branchAssignedAt: input.branchAssignedAt?.toISOString() ?? null,
  });
  return suggestion?.waitingSinceMs ?? null;
}

export function assertSchedulingEligibleRound(input: {
  roundId: string;
  branchInterviews: BranchJobApplicationInterviewListRow[];
  applicationStatus: string;
  branchAssignedAt: Date | null;
  activeRounds: Array<{
    id: string;
    name: string;
    sortOrder: number;
    status: InterviewRoundStatus;
  }>;
}): void {
  const selected = input.activeRounds.find((round) => round.id === input.roundId);
  if (!selected) {
    throw new BadRequestException('Interview round is not active or does not exist');
  }

  if (selected.status !== InterviewRoundStatus.ACTIVE) {
    throw new BadRequestException('Interview round is not active');
  }

  const suggestion = resolveJobApplicationSchedulingSuggestion({
    activeRounds: input.activeRounds,
    interviews: mapInterviewsToSchedulingTimeline(input.branchInterviews),
    applicationStatus: input.applicationStatus,
    branchAssignedAt: input.branchAssignedAt?.toISOString() ?? null,
  });

  if (!suggestion && input.branchInterviews.length === 0) {
    throw new BadRequestException(
      'This application is not eligible for interview scheduling',
    );
  }
}

export function assertScheduledAtNotBeforeEligible(input: {
  scheduledAt: Date;
  eligibleFromMs: number | null;
}): void {
  if (input.eligibleFromMs == null) return;
  if (input.scheduledAt.getTime() < input.eligibleFromMs) {
    throw new BadRequestException(
      'Interview date and time cannot be before the assignment or previous round clearance time',
    );
  }
}

export function assertNoDuplicateRoundScheduling(
  interviews: BranchJobApplicationInterviewListRow[],
  roundId: string,
  excludeInterviewId?: string,
): void {
  const conflict = interviews.find(
    (item) =>
      item.id !== excludeInterviewId &&
      item.roundId === roundId &&
      (item.status === InterviewStatus.SCHEDULED ||
        (item.status === InterviewStatus.ASSIGNED &&
          !hasPersistedSchedule(item.scheduledAt))),
  );

  if (conflict) {
    throw new BadRequestException(
      'An interview for this round is already open or scheduled',
    );
  }
}

export function assertApplicationAssignedToBranch(
  branchInterviews: BranchJobApplicationInterviewListRow[],
): void {
  if (!branchInterviews.length) {
    throw new ForbiddenException(
      'Application is not assigned to your branch',
    );
  }
}

export function resolveBranchAssignedAtForApplication(
  branchInterviews: BranchJobApplicationInterviewListRow[],
): Date | null {
  return resolveBranchAssignedAt(branchInterviews);
}

export function findLatestSelectedForNextRound(
  interviews: BranchJobApplicationInterviewListRow[],
): BranchJobApplicationInterviewListRow | null {
  const cleared = interviews
    .filter(
      (item) =>
        item.status === InterviewStatus.COMPLETED &&
        item.result === InterviewResult.SELECTED_FOR_NEXT_ROUND,
    )
    .sort(
      (a, b) =>
        (b.round?.sortOrder ?? b.roundNumber) -
        (a.round?.sortOrder ?? a.roundNumber),
    );
  return cleared[0] ?? null;
}

function normalizedRoundId(roundId?: string | null): string | null {
  const value = (roundId ?? '').trim();
  return value || null;
}

export function findReusableUnassignedInterviewShell(
  interviews: BranchJobApplicationInterviewListRow[],
): BranchJobApplicationInterviewListRow | null {
  return (
    interviews
      .filter(
        (item) =>
          item.status === InterviewStatus.ASSIGNED &&
          !normalizedRoundId(item.roundId) &&
          !hasPersistedSchedule(item.scheduledAt),
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0] ?? null
  );
}

export function shouldCreateInterviewForSelectedRound(input: {
  branchInterviews: BranchJobApplicationInterviewListRow[];
  roundId: string;
}): boolean {
  const latestSelected = findLatestSelectedForNextRound(input.branchInterviews);
  if (latestSelected) {
    return true;
  }

  const openOtherRound = input.branchInterviews.some(
    (item) =>
      item.status === InterviewStatus.ASSIGNED &&
      !hasPersistedSchedule(item.scheduledAt) &&
      normalizedRoundId(item.roundId) &&
      normalizedRoundId(item.roundId) !== input.roundId,
  );
  return openOtherRound;
}

export function pickOpenInterviewForScheduling(
  interviews: BranchJobApplicationInterviewListRow[],
  roundId: string,
): BranchJobApplicationInterviewListRow | null {
  const assignedForRound = interviews
    .filter(
      (item) =>
        item.status === InterviewStatus.ASSIGNED &&
        normalizedRoundId(item.roundId) === roundId &&
        !hasPersistedSchedule(item.scheduledAt),
    )
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
  if (assignedForRound) return assignedForRound;

  const assignedWithoutRound = findReusableUnassignedInterviewShell(interviews);
  if (assignedWithoutRound) return assignedWithoutRound;

  return (
    interviews
      .filter(
        (item) =>
          item.status === InterviewStatus.SCHEDULED &&
          normalizedRoundId(item.roundId) === roundId &&
          hasPersistedSchedule(item.scheduledAt),
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0] ?? null
  );
}

export function resolveInterviewerIdForSchedule(input: {
  existingInterviewerId?: string | null;
  isInterviewer: boolean;
  userSub: string;
  inputInterviewerId?: string;
}): string {
  if (input.existingInterviewerId) return input.existingInterviewerId;
  if (input.inputInterviewerId) return input.inputInterviewerId;
  if (input.isInterviewer) return input.userSub;
  return input.userSub;
}

/** Ordered unique interviewer ids to try when persisting a schedule. */
export function collectScheduleInterviewerCandidates(input: {
  inputInterviewerId?: string;
  existingInterviewerId?: string | null;
  branchInterviews: BranchJobApplicationInterviewListRow[];
  userSub: string;
}): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];
  const push = (id?: string | null) => {
    const value = (id ?? '').trim();
    if (!value || seen.has(value)) return;
    seen.add(value);
    ordered.push(value);
  };

  push(input.inputInterviewerId);
  push(input.existingInterviewerId);

  const byRecency = [...input.branchInterviews].sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
  );
  for (const row of byRecency) {
    push(row.interviewer?.id);
  }

  push(input.userSub);
  return ordered;
}
