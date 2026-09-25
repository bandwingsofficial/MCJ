import { InterviewStatus } from '@prisma/client';

import {
  buildBranchJobApplicationListInterviewScope,
  CURRENT_BRANCH_ASSIGNMENT_STATUSES,
} from './branch-job-application-assignment.util';

describe('buildBranchJobApplicationListInterviewScope', () => {
  it('includes completed interviews (not only open assignment statuses)', () => {
    const scope = buildBranchJobApplicationListInterviewScope({
      branchId: 'branch-1',
    });

    expect(scope).toMatchObject({
      branchId: 'branch-1',
      status: { not: InterviewStatus.CANCELLED },
    });
    expect(CURRENT_BRANCH_ASSIGNMENT_STATUSES).not.toContain(
      InterviewStatus.COMPLETED,
    );
    expect(scope.status).not.toEqual({
      in: CURRENT_BRANCH_ASSIGNMENT_STATUSES,
    });
  });

  it('matches round filter on current or pending next round', () => {
    const scope = buildBranchJobApplicationListInterviewScope({
      branchId: 'branch-1',
      roundId: 'round-2',
    });

    expect(scope).toMatchObject({
      OR: [{ roundId: 'round-2' }, { nextRoundId: 'round-2' }],
    });
  });
});
