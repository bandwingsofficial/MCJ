import { EnrollmentStatus } from '@prisma/client';

import {
  facultyBatchStudentWhere,
  facultyBranchBatchWhere,
} from './faculty-batch-query';

const MALLESWARAM = 'b4d1a2fd-42b1-4750-8622-f387116ba23a';
const OTHER_BRANCH = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
const MORNING = '863c57bc-648f-48f8-9c30-23f115b77f32';
const EVENING = '1ddbddca-83f4-443b-9d8b-702142498b57';

describe('faculty batch query contracts', () => {
  it('scopes Faculty batch lists to the JWT branchId', () => {
    expect(facultyBranchBatchWhere(MALLESWARAM)).toEqual({
      branchId: MALLESWARAM,
      isDeleted: false,
    });
    expect(facultyBranchBatchWhere(MALLESWARAM).branchId).not.toBe(
      OTHER_BRANCH,
    );
  });

  it('filters enrolled students by the current batchId and branchId', () => {
    const morning = facultyBatchStudentWhere(MORNING, MALLESWARAM);
    const evening = facultyBatchStudentWhere(EVENING, MALLESWARAM);

    expect(morning.batchId).toBe(MORNING);
    expect(evening.batchId).toBe(EVENING);
    expect(morning.batchId).not.toBe(evening.batchId);
    expect(morning.branchId).toBeUndefined();
    expect(morning.batch).toEqual({
      branchId: MALLESWARAM,
      isDeleted: false,
    });
    expect(morning.student).toEqual({ isDeleted: false });
    expect(morning.status).toEqual({
      in: [EnrollmentStatus.ADMITTED, EnrollmentStatus.ACTIVE],
    });
    expect(
      (morning.student as { branchId?: string } | undefined)?.branchId,
    ).toBeUndefined();
  });

  it('does not let a Morning enrollment where match Evening 1', () => {
    const morning = facultyBatchStudentWhere(MORNING, MALLESWARAM);
    expect(morning.batchId).not.toBe(EVENING);
  });
});
