import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { BranchUserRole } from '@modules/branch-user/domain/enums/branch-user-role.enum';
import type { BranchAuthUser } from '@common/decorators/current-branch-user.decorator';

import { BranchOperationsAccessService } from './branch-operations-access.service';

const MALLESWARAM = 'b4d1a2fd-42b1-4750-8622-f387116ba23a';

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
  it('returns 404 when Faculty requests a batch not assigned to their branch', async () => {
    const prisma = {
      batch: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
      branchUser: {
        findFirst: jest.fn().mockResolvedValue({ linkedTrainerId: null }),
      },
      batchFaculty: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };
    const access = new BranchOperationsAccessService(prisma as never);

    await expect(
      access.assertFacultyCanAccessBatch(facultyUser(), 'other-batch'),
    ).rejects.toBeInstanceOf(NotFoundException);
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

  it('scopes Faculty batch lists to BranchBatch assignments for the authenticated branchId', async () => {
    const prisma = {
      branchUser: {
        findFirst: jest.fn().mockResolvedValue({ linkedTrainerId: null }),
      },
      batchFaculty: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };
    const access = new BranchOperationsAccessService(prisma as never);
    const where = await access.branchBatchWhere(facultyUser());

    expect(where.isDeleted).toBe(false);
    expect(where.branchAssignments).toEqual({
      some: { branchId: MALLESWARAM },
    });
    expect(where.id).toBeUndefined();
  });

  it('allows a student enrolled in the branch when Enrollment.branchId matches', async () => {
    const morningId = '863c57bc-648f-48f8-9c30-23f115b77f32';
    const prisma = {
      batch: {
        findFirst: jest.fn().mockResolvedValue({
          id: morningId,
          name: 'morning',
          isActive: true,
        }),
      },
      branchUser: {
        findFirst: jest.fn().mockResolvedValue({ linkedTrainerId: null }),
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

    const where = prisma.enrollment.findFirst.mock.calls[0][0].where as {
      branchId?: string;
      batch?: { branchAssignments: { some: { branchId: string } } };
      studentId: string;
      batchId: string;
    };
    expect(where.studentId).toBe('student-akshay');
    expect(where.batchId).toBe(morningId);
    expect(where.branchId).toBe(MALLESWARAM);
    expect(where.batch).toEqual({
      isDeleted: false,
      branchAssignments: { some: { branchId: MALLESWARAM } },
    });
  });
});
