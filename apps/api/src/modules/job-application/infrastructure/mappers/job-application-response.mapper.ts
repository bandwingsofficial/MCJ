import { Prisma } from '@prisma/client';

import { JobApplicationStatus } from '../../domain/enums/job-application-status.enum';
import type {
  JobApplicationDetailView,
  JobApplicationJobView,
  JobApplicationUserProfileView,
  JobApplicationUserView,
} from '../../domain/repositories/job-application.repository';

export const jobApplicationDetailInclude = {
  job: true,
  Student: true,
} satisfies Prisma.JobApplicationInclude;

type JobApplicationWithRelations = Prisma.JobApplicationGetPayload<{
  include: typeof jobApplicationDetailInclude;
}>;

export class JobApplicationResponseMapper {
  static toDetail(
    record: JobApplicationWithRelations,
  ): JobApplicationDetailView {
    return {
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
      isDeleted: record.isDeleted,
      deletedAt: record.deletedAt,
      job: this.toJob(record.job),
      user: this.toUser(record.Student),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  private static toJob(
    job: JobApplicationWithRelations['job'],
  ): JobApplicationJobView {
    return {
      id: job.id,
      title: job.title,
      slug: job.slug,
      companyName: job.companyName,
      status: job.status,
      employmentType: job.employmentType,
    };
  }

  private static toUser(
    student: JobApplicationWithRelations['Student'],
  ): JobApplicationUserView {
    const name = [student.firstName, student.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();

    return {
      id: student.id,
      name: name || student.firstName,
      email: student.email ?? '',
      phone: student.phone,
      role: 'STUDENT',
      status: student.status,
      isEmailVerified: false,
      lastLoginAt: null,
      createdAt: student.createdAt,
      profile: this.toProfile(student),
    };
  }

  private static toProfile(
    student: JobApplicationWithRelations['Student'],
  ): JobApplicationUserProfileView {
    return {
      firstName: student.firstName,
      lastName: student.lastName,
      profileImage: student.profileImageUrl,
      city: student.city,
      state: student.state,
      country: student.country,
    };
  }
}