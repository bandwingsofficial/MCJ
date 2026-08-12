import {
  JobApplication as PrismaJobApplication,
  Prisma,
} from '@prisma/client';

import { JobApplication } from '../../domain/entities/job-application.entity';
import { JobApplicationStatus } from '../../domain/enums/job-application-status.enum';

export class JobApplicationMapper {
  static toDomain(
    record: PrismaJobApplication,
  ): JobApplication {
    return JobApplication.reconstitute({
      id: record.id,
      jobId: record.jobId,
      studentId: record.studentId,
      resumeFileId: record.resumeFileId,
      coverLetter: record.coverLetter,
      currentLocation: record.currentLocation,
      expectedSalary: record.expectedSalary
        ? Number(record.expectedSalary)
        : null,
      remarks: record.remarks,
      status: record.status as JobApplicationStatus,
      createdBy: record.createdBy,
      updatedBy: record.updatedBy,
      isDeleted: record.isDeleted,
      deletedAt: record.deletedAt,
      deletedBy: record.deletedBy,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  static toPersistence(
    application: JobApplication,
  ): Prisma.JobApplicationUncheckedCreateInput {
    return {
      id: application.id,
      jobId: application.jobId,
      studentId: application.studentId,
      resumeFileId: application.resumeFileId,
      coverLetter: application.coverLetter,
      currentLocation: application.currentLocation,
      expectedSalary: application.expectedSalary,
      remarks: application.remarks,
      status: application.status,
      createdBy: application.createdBy,
      updatedBy: application.updatedBy,
      isDeleted: application.isDeleted,
      deletedAt: application.deletedAt,
      deletedBy: application.deletedBy,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
    };
  }
}