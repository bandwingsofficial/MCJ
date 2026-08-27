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
      applicationNumber: record.applicationNumber,
      applicantName: record.applicantName,
      applicantEmail: record.applicantEmail,
      applicantPhone: record.applicantPhone,
      highestQualification: record.highestQualification,
      yearsOfExperience: record.yearsOfExperience,
      resumeFileId: record.resumeFileId,
      coverLetter: record.coverLetter,
      currentLocation: record.currentLocation,
      expectedSalary: record.expectedSalary
        ? Number(record.expectedSalary)
        : null,
      remarks: record.remarks,
      createdBy: record.createdBy,
      status: record.status as JobApplicationStatus,
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
      applicationNumber: application.applicationNumber,
      applicantName: application.applicantName,
      applicantEmail: application.applicantEmail,
      applicantPhone: application.applicantPhone,
      highestQualification: application.highestQualification,
      yearsOfExperience: application.yearsOfExperience,
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
