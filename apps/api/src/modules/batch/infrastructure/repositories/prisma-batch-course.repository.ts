import { randomUUID } from 'crypto';

import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import type {
  BatchCourseAssignmentRecord,
  BatchCourseTrainerRecord,
} from '../../application/batch-courses/batch-course.types';
import { formatBatchSessionCode } from '../../domain/utils/batch-session.util';

const courseAssignmentSelect = {
  id: true,
  title: true,
  code: true,
  tagline: true,
  shortDescription: true,
  description: true,
  thumbnailUrl: true,
  minimumQualifications: true,
  category: {
    select: {
      id: true,
      name: true,
    },
  },
} as const;

const trainerAssignmentSelect = {
  id: true,
  firstName: true,
  lastName: true,
  employeeCode: true,
  status: true,
  profileImageUrl: true,
  specialization: true,
  email: true,
  qualification: true,
} as const;

const assignmentInclude = {
  course: {
    select: {
      ...courseAssignmentSelect,
      trainers: {
        where: {
          trainer: {
            isDeleted: false,
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
        select: {
          trainer: {
            select: trainerAssignmentSelect,
          },
        },
      },
    },
  },
  session: {
    select: {
      id: true,
      sessionNumber: true,
    },
  },
} as const;

type AssignmentQueryRecord = {
  id: string;
  batchId: string;
  courseId: string;
  trainerId: string | null;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  session?: {
    id: string;
    sessionNumber: number;
  } | null;
  course: {
    id: string;
    title: string;
    code: string;
    tagline: string | null;
    shortDescription: string | null;
    description: string | null;
    thumbnailUrl: string | null;
    minimumQualifications: string[];
    category: {
      id: string;
      name: string;
    } | null;
    trainers: Array<{
      trainer: BatchCourseTrainerRecord | null;
    }>;
  };
};

function toAssignmentRecord(
  record: AssignmentQueryRecord,
): BatchCourseAssignmentRecord {
  const { trainers: trainerLinks, ...course } = record.course;
  const trainers = trainerLinks
    .map((link) => link.trainer)
    .filter((trainer): trainer is BatchCourseTrainerRecord => trainer != null);

  const session = record.session
    ? {
        id: record.session.id,
        number: record.session.sessionNumber,
        code: formatBatchSessionCode(record.session.sessionNumber),
      }
    : null;

  return {
    id: record.id,
    batchId: record.batchId,
    courseId: record.courseId,
    trainerId: record.trainerId,
    isActive: record.isActive,
    isDeleted: record.isDeleted,
    deletedAt: record.deletedAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    session,
    course,
    trainers,
    trainer: trainers[0] ?? null,
  };
}

export class PrismaBatchCourseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByBatchId(batchId: string): Promise<BatchCourseAssignmentRecord[]> {
    return this.findByBatchIds([batchId]);
  }

  async findByBatchIds(
    batchIds: string[],
  ): Promise<BatchCourseAssignmentRecord[]> {
    if (!batchIds.length) {
      return [];
    }

    const records = await this.prisma.batchCourse.findMany({
      where: {
        batchId: { in: batchIds },
        isDeleted: false,
      },
      include: assignmentInclude,
      orderBy: [{ session: { sessionNumber: 'asc' } }, { createdAt: 'asc' }],
    });

    return records.map((record) =>
      toAssignmentRecord(record as AssignmentQueryRecord),
    );
  }

  async assign(params: {
    batchId: string;
    courseId: string;
  }): Promise<BatchCourseAssignmentRecord> {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.batchCourse.findUnique({
        where: {
          batchId_courseId: {
            batchId: params.batchId,
            courseId: params.courseId,
          },
        },
        include: {
          session: { select: { id: true, sessionNumber: true } },
        },
      });

      if (existing && !existing.isDeleted) {
        throw new Error('Course is already assigned to this batch');
      }

      const assignment = existing
        ? await tx.batchCourse.update({
            where: { id: existing.id },
            data: {
              isActive: true,
              isDeleted: false,
              deletedAt: null,
            },
            include: assignmentInclude,
          })
        : await tx.batchCourse.create({
            data: {
              id: randomUUID(),
              batchId: params.batchId,
              courseId: params.courseId,
            },
            include: assignmentInclude,
          });

      const existingSession =
        existing?.session ??
        (assignment as AssignmentQueryRecord).session ??
        null;

      if (!existingSession) {
        const aggregate = await tx.batchCourseSession.aggregate({
          where: { batchId: params.batchId },
          _max: { sessionNumber: true },
        });
        const nextNumber = (aggregate._max.sessionNumber ?? 0) + 1;

        await tx.batchCourseSession.create({
          data: {
            id: randomUUID(),
            batchId: params.batchId,
            batchCourseId: assignment.id,
            sessionNumber: nextNumber,
          },
        });
      }

      const withSession = await tx.batchCourse.findUniqueOrThrow({
        where: { id: assignment.id },
        include: assignmentInclude,
      });

      return toAssignmentRecord(withSession as AssignmentQueryRecord);
    });
  }

  async remove(assignmentId: string, batchId: string): Promise<void> {
    await this.prisma.batchCourse.updateMany({
      where: {
        id: assignmentId,
        batchId,
        isDeleted: false,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        isActive: false,
      },
    });
  }

  /**
   * Ensure exactly one active BatchCourse for (batchId, courseId),
   * soft-removing any other non-deleted assignments for the batch.
   */
  async syncPrimaryCourse(params: {
    batchId: string;
    courseId: string;
  }): Promise<void> {
    const existing = await this.findByBatchId(params.batchId);
    const primary = existing.find(
      (assignment) => assignment.courseId === params.courseId,
    );

    if (!primary) {
      try {
        await this.assign(params);
      } catch (error) {
        if (
          !(
            error instanceof Error &&
            error.message.includes('already assigned')
          )
        ) {
          throw error;
        }
      }
    }

    const others = existing.filter(
      (assignment) => assignment.courseId !== params.courseId,
    );

    for (const other of others) {
      await this.remove(other.id, params.batchId);
    }
  }
}
