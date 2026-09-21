import { Prisma } from '@prisma/client';
import { InterviewStatus } from '@prisma/client';

import { JobApplicationInterviewStatus } from '../../domain/enums/job-application-interview-status.enum';
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
  interviews: {
    where: {
      status: {
        in: [
          InterviewStatus.ASSIGNED,
          InterviewStatus.SCHEDULED,
          InterviewStatus.COMPLETED,
          InterviewStatus.CANCELLED,
          InterviewStatus.NO_SHOW,
        ],
      },
    },
    orderBy: [
      { roundNumber: 'desc' as const },
      { createdAt: 'desc' as const },
    ],
    take: 5,
    select: {
      id: true,
      status: true,
      branchId: true,
      interviewerId: true,
      scheduledAt: true,
      mode: true,
      locationOrLink: true,
      roundNumber: true,
      notes: true,
      branch: {
        select: {
          id: true,
          branchName: true,
          branchCode: true,
          addressLine1: true,
          addressLine2: true,
          city: true,
          state: true,
          country: true,
          postalCode: true,
        },
      },
      interviewer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  },
} satisfies Prisma.JobApplicationInclude;

type JobApplicationWithRelations = Prisma.JobApplicationGetPayload<{
  include: typeof jobApplicationDetailInclude;
}>;

const SCHEDULE_EPOCH_GUARD_MS = Date.parse('1970-01-02T00:00:00.000Z');

function pickInterviewAssignment(
  interviews: JobApplicationWithRelations['interviews'],
) {
  if (!interviews.length) {
    return null;
  }

  const scheduled = interviews.find((interview) => {
    if (interview.status === InterviewStatus.ASSIGNED) {
      return false;
    }
    if (!interview.scheduledAt) {
      return false;
    }
    return interview.scheduledAt.getTime() > SCHEDULE_EPOCH_GUARD_MS;
  });

  return scheduled ?? interviews[0] ?? null;
}

export class JobApplicationResponseMapper {
  static toDetail(
    record: JobApplicationWithRelations,
  ): JobApplicationDetailView {
    const interview = pickInterviewAssignment(record.interviews);

    return {
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
      rejectionReason: record.rejectionReason,
      status: record.status as JobApplicationStatus,
      interviewStatus:
        record.interviewStatus as JobApplicationInterviewStatus,
      isDeleted: record.isDeleted,
      deletedAt: record.deletedAt,
      job: this.toJob(record.job),
      user: this.toUser(record),
      student: this.toStudent(record.Student),
      interviewAssignment: interview
        ? {
            id: interview.id,
            status: interview.status,
            branchId: interview.branchId,
            interviewerId: interview.interviewerId,
            scheduledAt: interview.scheduledAt,
            mode: interview.mode,
            locationOrLink: interview.locationOrLink,
            roundNumber: interview.roundNumber,
            notes: interview.notes,
            branch: interview.branch,
            interviewer: interview.interviewer,
          }
        : null,
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
      jobNumber: job.jobNumber,
      companyName: job.companyName,
      status: job.status,
      employmentType: job.employmentType,
    };
  }

  private static toUser(
    record: JobApplicationWithRelations,
  ): JobApplicationUserView | null {
    const student = record.Student;

    if (!student) {
      if (!record.applicantName && !record.applicantEmail) {
        return null;
      }

      return {
        id: record.id,
        name: record.applicantName ?? '',
        email: record.applicantEmail ?? '',
        phone: record.applicantPhone,
        role: 'CANDIDATE',
        status: 'APPLIED',
        isEmailVerified: false,
        lastLoginAt: null,
        createdAt: record.createdAt,
        profile: {
          firstName: record.applicantName,
          lastName: null,
          profileImage: null,
          city: record.currentLocation,
          state: null,
          country: null,
        },
      };
    }

    const name = [student.firstName, student.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();

    return {
      id: student.id,
      name: name || student.firstName,
      email: student.email ?? record.applicantEmail ?? '',
      phone: student.phone ?? record.applicantPhone,
      role: 'STUDENT',
      status: student.status,
      isEmailVerified: false,
      lastLoginAt: null,
      createdAt: student.createdAt,
      profile: this.toProfile(student),
    };
  }

  private static toProfile(
    student: NonNullable<JobApplicationWithRelations['Student']>,
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

  private static toStudent(
    student: JobApplicationWithRelations['Student'],
  ): JobApplicationDetailView['student'] {
    if (!student) {
      return null;
    }

    return {
      id: student.id,
      studentCode: student.studentCode,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      phone: student.phone,
      gender: student.gender,
      dateOfBirth: student.dateOfBirth,
      addressLine1: student.addressLine1,
      addressLine2: student.addressLine2,
      city: student.city,
      state: student.state,
      country: student.country,
      postalCode: student.postalCode,
      qualification: student.qualification,
      collegeName: student.collegeName,
      specialization: student.specialization,
      passingYear: student.passingYear,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      emergencyContactName: student.emergencyContactName,
      emergencyContactPhone: student.emergencyContactPhone,
      notes: student.notes,
      status: student.status,
      jobStatus: student.jobStatus,
    };
  }
}
