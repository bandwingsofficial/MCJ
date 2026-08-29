import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AttendanceStatus,
  EnrollmentStatus,
  Prisma,
} from '@prisma/client';

import type { BranchAuthUser } from '@common/decorators/current-branch-user.decorator';
import { BranchUserRole } from '@modules/branch-user/domain/enums/branch-user-role.enum';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import {
  facultyBranchBatchWhere,
  facultyBranchEnrollmentWhere,
} from './faculty-batch-query';
import { resolveFacultyBatchScope } from './faculty-batch-scope';

const ACTIVE_ENROLLMENT_STATUSES: EnrollmentStatus[] = [
  EnrollmentStatus.ADMITTED,
  EnrollmentStatus.ACTIVE,
];

@Injectable()
export class BranchOperationsAccessService {
  constructor(private readonly prisma: PrismaService) {}

  scopedBranchId(user: BranchAuthUser): string {
    return user.branchId;
  }

  isManager(user: BranchAuthUser): boolean {
    return user.role === BranchUserRole.BRANCH_MANAGER;
  }

  isFaculty(user: BranchAuthUser): boolean {
    return user.role === BranchUserRole.FACULTY;
  }

  isInterviewer(user: BranchAuthUser): boolean {
    return user.role === BranchUserRole.INTERVIEWER;
  }

  async log(params: {
    user: BranchAuthUser;
    action: string;
    resourceType: string;
    resourceId: string;
    metadata?: Prisma.InputJsonValue;
  }): Promise<void> {
    await this.prisma.branchActivityLog.create({
      data: {
        branchId: params.user.branchId,
        actorId: params.user.sub,
        action: params.action,
        resourceType: params.resourceType,
        resourceId: params.resourceId,
        metadata: params.metadata,
      },
    });
  }

  async getAssignedBatchIds(user: BranchAuthUser): Promise<string[]> {
    const rows = await this.prisma.batchFaculty.findMany({
      where: {
        branchUserId: user.sub,
        batch: {
          branchId: user.branchId,
          isDeleted: false,
        },
      },
      select: { batchId: true },
    });

    return rows.map((row) => row.batchId);
  }

  async visibleBatchIds(user: BranchAuthUser): Promise<string[] | null> {
    const assigned = this.isFaculty(user)
      ? await this.getAssignedBatchIds(user)
      : [];
    const scope = resolveFacultyBatchScope(user.role, assigned);
    return scope === 'ALL_BRANCH' ? null : scope.in;
  }

  async branchBatchWhere(
    user: BranchAuthUser,
  ): Promise<Prisma.BatchWhereInput> {
    const ids = await this.visibleBatchIds(user);
    return facultyBranchBatchWhere(user.branchId, ids);
  }

  facultyBatchFilter(
    user: BranchAuthUser,
    batchIds: string[],
  ): Prisma.BatchWhereInput {
    const where = facultyBranchBatchWhere(user.branchId);
    const scope = resolveFacultyBatchScope(user.role, batchIds);
    if (scope !== 'ALL_BRANCH') {
      where.id = { in: scope.in };
    }
    return where;
  }

  async assertBatchInBranch(batchId: string, branchId: string) {
    const batch = await this.prisma.batch.findFirst({
      where: { id: batchId, isDeleted: false },
      select: { id: true, branchId: true, name: true, isActive: true },
    });

    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    if (batch.branchId !== branchId) {
      throw new ForbiddenException('Branch access denied');
    }

    return batch;
  }

  async assertFacultyCanAccessBatch(
    user: BranchAuthUser,
    batchId: string,
  ): Promise<void> {
    await this.assertBatchInBranch(batchId, user.branchId);

    if (this.isInterviewer(user)) {
      throw new ForbiddenException('Role access denied');
    }

    if (!this.isFaculty(user)) {
      return;
    }

    const assigned = await this.getAssignedBatchIds(user);
    const scope = resolveFacultyBatchScope(user.role, assigned);

    if (scope === 'ALL_BRANCH') {
      return;
    }

    if (!scope.in.includes(batchId)) {
      throw new ForbiddenException('Faculty is not assigned to this batch');
    }
  }

  async assertStudentInBranch(studentId: string, branchId: string) {
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, isDeleted: false },
      select: { id: true, branchId: true },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    if (student.branchId !== branchId) {
      throw new ForbiddenException('Branch access denied');
    }

    return student;
  }

  async assertFacultyCanAccessStudent(
    user: BranchAuthUser,
    studentId: string,
    batchId?: string,
  ): Promise<void> {
    if (this.isInterviewer(user)) {
      throw new ForbiddenException('Role access denied');
    }

    if (batchId) {
      await this.assertFacultyCanAccessBatch(user, batchId);
    } else if (!this.isFaculty(user)) {
      await this.assertStudentInBranch(studentId, user.branchId);
      return;
    }

    const assignedBatchIds = await this.visibleBatchIds(user);

    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        ...facultyBranchEnrollmentWhere(user.branchId, {
          studentId,
          batchId,
          batchIds: batchId ? undefined : assignedBatchIds,
        }),
        status: { in: ACTIVE_ENROLLMENT_STATUSES },
      },
    });

    if (!enrollment) {
      throw new ForbiddenException(
        'Faculty is not assigned to this student',
      );
    }
  }

  attendanceStatus(): typeof AttendanceStatus {
    return AttendanceStatus;
  }
}
