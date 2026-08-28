import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { BranchUserRole } from '@modules/branch-user/domain/enums/branch-user-role.enum';
import type { BranchAuthUser } from '@common/decorators/current-branch-user.decorator';

import { BranchOperationsAccessService } from './branch-operations-access.service';

const MALLESWARAM = 'b4d1a2fd-42b1-4750-8622-f387116ba23a';
const OTHER_BRANCH = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

function facultyUser(branchId = MALLESWARAM): BranchAuthUser {
  return {
    sub: 'faculty-1',
    sessionId: 'session-1',
    branchId,
    email: 'faculty@example.com',
    role: BranchUserRole.FACULTY,
    permissions: [],
  };
}

describe('BranchOperationsAccessService', () => {
  it('returns 403 when Faculty requests a batch from another branch', async () => {
    const prisma = {
      batch: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'other-batch',
          branchId: OTHER_BRANCH,
          name: 'Other branch batch',
          isActive: true,
        }),
      },
      batchFaculty: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };
    const access = new BranchOperationsAccessService(prisma as never);

    await expect(
      access.assertFacultyCanAccessBatch(facultyUser(), 'other-batch'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('returns 404 when the batch does not exist', async () => {
    const prisma = {
      batch: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
    };
    const access = new BranchOperationsAccessService(prisma as never);

    await expect(
      access.assertFacultyCanAccessBatch(facultyUser(), 'missing'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('scopes Faculty batch lists to the authenticated branchId', async () => {
    const prisma = {
      batchFaculty: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };
    const access = new BranchOperationsAccessService(prisma as never);
    const where = await access.branchBatchWhere(facultyUser());

    expect(where.branchId).toBe(MALLESWARAM);
    expect(where.isDeleted).toBe(false);
    expect(where.id).toBeUndefined();
  });

  it('allows a student enrolled in the Faculty branch batch even if Student.branchId differs', async () => {
    const morningId = '863c57bc-648f-48f8-9c30-23f115b77f32';
    const prisma = {
      batch: {
        findFirst: jest.fn().mockResolvedValue({
          id: morningId,
          branchId: MALLESWARAM,
          name: 'morning',
          isActive: true,
        }),
      },
      batchFaculty: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      enrollment: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'enroll-1',
          studentId: 'student-akshay',
          batchId: morningId,
          branchId: MALLESWARAM,
        }),
      },
    };
    const access = new BranchOperationsAccessService(prisma as never);

    await expect(
      access.assertFacultyCanAccessStudent(
        facultyUser(),
        'student-akshay',
        morningId,
      ),
    ).resolves.toBeUndefined();
  });
});
