import type { InterviewResult, InterviewStatus, Prisma } from '@prisma/client';

import { mapInterviewerDisplayName } from '@modules/job-application/infrastructure/mappers/map-interviewer-display.util';

export type BranchJobApplicationInterviewListRow = {
  id: string;
  scheduledAt: Date | null;
  durationMinutes: number;
  mode: string | null;
  locationOrLink: string | null;
  roundId: string | null;
  nextRoundId: string | null;
  roundNumber: number;
  result: InterviewResult;
  status: InterviewStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  interviewer: {
    id: string;
    firstName: string;
    lastName: string | null;
    email: string;
  } | null;
  branch: {
    id: string;
    branchName: string;
    branchCode: string;
  } | null;
  round: {
    id: string;
    name: string;
    sortOrder: number;
  } | null;
  nextRound: {
    id: string;
    name: string;
    sortOrder: number;
  } | null;
};

type InterviewIncludeRow = Prisma.InterviewGetPayload<{
  include: {
    interviewer: {
      select: {
        id: true;
        firstName: true;
        lastName: true;
        email: true;
        linkedTrainer: {
          select: {
            id: true;
            firstName: true;
            lastName: true;
          };
        };
      };
    };
    branch: {
      select: { id: true; branchName: true; branchCode: true };
    };
    round: {
      select: {
        id: true;
        name: true;
        sortOrder: true;
        status: true;
      };
    };
    nextRound: {
      select: {
        id: true;
        name: true;
        sortOrder: true;
        status: true;
      };
    };
  };
}>;

export function mapBranchJobApplicationInterviews(
  interviews: InterviewIncludeRow[],
): BranchJobApplicationInterviewListRow[] {
  return interviews.map((item) => ({
    id: item.id,
    scheduledAt: item.scheduledAt,
    durationMinutes: item.durationMinutes,
    mode: item.mode,
    locationOrLink: item.locationOrLink,
    roundId: item.roundId,
    nextRoundId: item.nextRoundId,
    roundNumber: item.roundNumber,
    result: item.result,
    status: item.status,
    notes: item.notes,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    interviewer: mapInterviewerDisplayName(item.interviewer),
    branch: item.branch,
    round: item.round
      ? {
          id: item.round.id,
          name: item.round.name,
          sortOrder: item.round.sortOrder,
        }
      : null,
    nextRound: item.nextRound
      ? {
          id: item.nextRound.id,
          name: item.nextRound.name,
          sortOrder: item.nextRound.sortOrder,
        }
      : null,
  }));
}

export function serializeBranchJobApplicationInterview(
  interview: BranchJobApplicationInterviewListRow,
) {
  return {
    id: interview.id,
    scheduledAt: interview.scheduledAt,
    durationMinutes: interview.durationMinutes,
    mode: interview.mode,
    locationOrLink: interview.locationOrLink,
    roundId: interview.roundId,
    nextRoundId: interview.nextRoundId,
    roundNumber: interview.roundNumber,
    result: interview.result,
    status: interview.status,
    notes: interview.notes,
    createdAt: interview.createdAt.toISOString(),
    updatedAt: interview.updatedAt.toISOString(),
    interviewer: interview.interviewer,
    branch: interview.branch,
    round: interview.round,
    nextRound: interview.nextRound,
  };
}
