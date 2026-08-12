import { Placement as PrismaPlacement, Prisma } from '@prisma/client';

import { Placement } from '../../domain/entities/placement.entity';
import { PlacementStatus } from '../../domain/enums/placement-status.enum';

export class PlacementMapper {
  static toDomain(record: PrismaPlacement): Placement {
    return Placement.reconstitute({
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
      createdBy: record.createdBy,
      updatedBy: record.updatedBy,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  static toPersistence(
    placement: Placement,
  ): Prisma.PlacementUncheckedCreateInput {
    return {
      id: placement.id,
      jobId: placement.jobId,
      applicationId: placement.applicationId,
      studentId: placement.userId,
      companyName: placement.companyName,
      designation: placement.designation,
      salary: placement.salary,
      joiningDate: placement.joiningDate,
      remarks: placement.remarks,
      status: placement.status,
      createdBy: placement.createdBy,
      updatedBy: placement.updatedBy,
      createdAt: placement.createdAt,
      updatedAt: placement.updatedAt,
    };
  }
}
