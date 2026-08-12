import { Prisma } from '@prisma/client';

import { PlacementStatus } from '../../domain/enums/placement-status.enum';
import type {
  PlacementDetailView,
  PlacementJobView,
  PlacementUserProfileView,
  PlacementUserView,
} from '../../domain/repositories/placement.repository';

export const placementDetailInclude = {
  job: true,
  Student: true,
} satisfies Prisma.PlacementInclude;

type PlacementWithRelations = Prisma.PlacementGetPayload<{
  include: typeof placementDetailInclude;
}>;

export class PlacementResponseMapper {
  static toDetail(
    record: PlacementWithRelations,
  ): PlacementDetailView {
    return {
      id: record.id,
      jobId: record.jobId,
      applicationId: record.applicationId,
      userId: record.studentId,
      companyName: record.companyName,
      designation: record.designation,
      salary: record.salary ? Number(record.salary) : null,
      joiningDate: record.joiningDate,
      remarks: record.remarks,
      status: record.status as PlacementStatus,
      job: this.toJob(record.job),
      user: this.toUser(record.Student),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  private static toJob(
    job: PlacementWithRelations['job'],
  ): PlacementJobView {
    return {
      id: job.id,
      title: job.title,
      slug: job.slug,
      companyName: job.companyName,
    };
  }

  private static toUser(
    student: PlacementWithRelations['Student'],
  ): PlacementUserView {
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
      profile: this.toProfile(student),
    };
  }

  private static toProfile(
    student: PlacementWithRelations['Student'],
  ): PlacementUserProfileView {
    return {
      firstName: student.firstName,
      lastName: student.lastName,
      profileImage: student.profileImageUrl,
    };
  }
}
