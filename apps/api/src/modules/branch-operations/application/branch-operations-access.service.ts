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
      where: { branchUserId: user.sub },
      select: { batchId: true },
    });

    return rows.map((row) => row.batchId);
  }

  async assertBatchInBranch(batchId: string, branchId: string) {
    const batch = await this.prisma.batch.findFirst({
      where: { id: batchId, isDeleted: false },
      select: { id: true, branchId: true, name: true },
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

    if (this.isFaculty(user)) {
      const assigned = await this.prisma.batchFaculty.findUnique({
        where: {
          batchId_branchUserId: {
            batchId,
            branchUserId: user.sub,
          },
        },
      });

      if (!assigned) {
        throw new ForbiddenException(
          'Faculty is not assigned to this batch',
        );
      }

      return;
    }

    if (this.isInterviewer(user)) {
      throw new ForbiddenException('Role access denied');
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
    await this.assertStudentInBranch(studentId, user.branchId);

    if (this.isFaculty(user)) {
      const assignedBatchIds = await this.getAssignedBatchIds(user);

      if (!assignedBatchIds.length) {
        throw new ForbiddenException(
          'Faculty is not assigned to this student',
        );
      }

      const enrollment = await this.prisma.enrollment.findFirst({
        where: {
          studentId,
          isDeleted: false,
          batchId: batchId
            ? batchId
            : { in: assignedBatchIds },
          status: { in: ACTIVE_ENROLLMENT_STATUSES },
        },
      });

      if (!enrollment) {
        throw new ForbiddenException(
          'Faculty is not assigned to this student',
        );
      }

      if (batchId) {
        await this.assertFacultyCanAccessBatch(user, batchId);
      }

      return;
    }

    if (this.isInterviewer(user)) {
      throw new ForbiddenException('Role access denied');
    }
  }

  facultyBatchFilter(user: BranchAuthUser, batchIds: string[]) {
    if (this.isFaculty(user)) {
      return {
        branchId: user.branchId,
        isDeleted: false,
        id: { in: batchIds.length ? batchIds : ['__none__'] },
      };
    }

    return { branchId: user.branchId, isDeleted: false };
  }

  attendanceStatus(): typeof AttendanceStatus {
    return AttendanceStatus;
  }
}
