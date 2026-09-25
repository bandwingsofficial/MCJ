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
import {
  jobApplicationInterviewerSelect,
  mapInterviewerDisplayName,
} from './map-interviewer-display.util';

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
      { roundNumber: 'asc' as const },
      { createdAt: 'asc' as const },
    ],
    take: 20,
    select: {
      id: true,
      status: true,
      result: true,
      evaluation: true,
      branchId: true,
      interviewerId: true,
      roundId: true,
      nextRoundId: true,
      scheduledAt: true,
      mode: true,
      locationOrLink: true,
      roundNumber: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
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
        select: jobApplicationInterviewerSelect,
      },
      round: {
        select: {
          id: true,
          name: true,
          sortOrder: true,
        },
      },
      nextRound: {
        select: {
          id: true,
          name: true,
          sortOrder: true,
        },
      },
    },
  },
} satisfies Prisma.JobApplicationInclude;

type JobApplicationWithRelations = Prisma.JobApplicationGetPayload<{
  include: typeof jobApplicationDetailInclude;
}>;

const SCHEDULE_EPOCH_GUARD_MS = Date.parse('1970-01-02T00:00:00.000Z');

function mapInterviewAssignment(
  interview: JobApplicationWithRelations['interviews'][number],
) {
  return {
    id: interview.id,
    status: interview.status,
    result: interview.result ?? null,
    evaluation: interview.evaluation ?? null,
    branchId: interview.branchId,
    interviewerId: interview.interviewerId,
    roundId: interview.roundId ?? null,
    nextRoundId: interview.nextRoundId ?? null,
    scheduledAt: interview.scheduledAt,
    mode: interview.mode,
    locationOrLink: interview.locationOrLink,
    roundNumber: interview.roundNumber,
    notes: interview.notes,
    createdAt: interview.createdAt,
    updatedAt: interview.updatedAt,
    branch: interview.branch,
    interviewer: mapInterviewerDisplayName(interview.interviewer),
    round: interview.round ?? null,
    nextRound: interview.nextRound ?? null,
  };
}

function pickBranchInterviewerAssignment(
  interviews: JobApplicationWithRelations['interviews'],
) {
  for (let index = interviews.length - 1; index >= 0; index -= 1) {
    const interview = interviews[index];
    if (
      interview.status === InterviewStatus.ASSIGNED ||
      interview.status === InterviewStatus.SCHEDULED
    ) {
      return interview;
    }
  }

  // Interview results stay on COMPLETED rows; assignment is not cleared until admin unassign.
  for (let index = interviews.length - 1; index >= 0; index -= 1) {
    const interview = interviews[index];
    if (
      interview.status === InterviewStatus.COMPLETED &&
      interview.branchId &&
      interview.interviewerId
    ) {
      return interview;
    }
  }

  return null;
}

function pickInterviewAssignment(
  interviews: JobApplicationWithRelations['interviews'],
) {
  if (!interviews.length) {
    return null;
  }

  // Prefer the highest-round currently scheduled interview (e.g. HR over Technical).
  let scheduledPick: JobApplicationWithRelations['interviews'][number] | null =
    null;
  for (const interview of interviews) {
    if (
      interview.status === InterviewStatus.SCHEDULED &&
      interview.scheduledAt &&
      interview.scheduledAt.getTime() > SCHEDULE_EPOCH_GUARD_MS &&
      (!scheduledPick ||
        interview.roundNumber > scheduledPick.roundNumber ||
        (interview.roundNumber === scheduledPick.roundNumber &&
          interview.createdAt.getTime() > scheduledPick.createdAt.getTime()))
    ) {
      scheduledPick = interview;
    }
  }
  if (scheduledPick) {
    return scheduledPick;
  }

  // Then the latest assignment awaiting schedule.
  for (let index = interviews.length - 1; index >= 0; index -= 1) {
    if (interviews[index].status === InterviewStatus.ASSIGNED) {
      return interviews[index];
    }
  }

  // Then the latest completed interview (highest round / newest).
  for (let index = interviews.length - 1; index >= 0; index -= 1) {
    if (interviews[index].status === InterviewStatus.COMPLETED) {
      return interviews[index];
    }
  }

  // Otherwise the most recent interview record.
  return interviews[interviews.length - 1] ?? null;
}

export class JobApplicationResponseMapper {
  static toDetail(
    record: JobApplicationWithRelations,
  ): JobApplicationDetailView {
    const interview = pickInterviewAssignment(record.interviews);
    const branchInterviewerAssignment = pickBranchInterviewerAssignment(
      record.interviews,
    );

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
        ? mapInterviewAssignment(interview)
        : null,
      branchInterviewerAssignment: branchInterviewerAssignment
        ? mapInterviewAssignment(branchInterviewerAssignment)
        : null,
      interviews: record.interviews.map(mapInterviewAssignment),
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
