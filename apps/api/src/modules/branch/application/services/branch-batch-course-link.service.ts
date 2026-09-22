import type { PrismaService } from '@/infrastructure/prisma/prisma.service';

export async function resolveCourseIdsForBatch(
  prisma: PrismaService,
  batchId: string,
): Promise<string[]> {
  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
    select: {
      courseId: true,
      batchCourses: {
        where: { isDeleted: false },
        select: { courseId: true },
      },
    },
  });

  if (!batch) {
    return [];
  }

  const courseIds = new Set<string>();

  if (batch.courseId) {
    courseIds.add(batch.courseId);
  }

  for (const row of batch.batchCourses) {
    courseIds.add(row.courseId);
  }

  return [...courseIds];
}

export async function resolveCourseIdsForBatchesAtBranch(
  prisma: PrismaService,
  branchId: string,
  excludeBatchId?: string,
): Promise<Set<string>> {
  const assignments = await prisma.branchBatch.findMany({
    where: {
      branchId,
      ...(excludeBatchId ? { batchId: { not: excludeBatchId } } : {}),
    },
    select: {
      batch: {
        select: {
          courseId: true,
          batchCourses: {
            where: { isDeleted: false },
            select: { courseId: true },
          },
        },
      },
    },
  });

  const courseIds = new Set<string>();

  for (const assignment of assignments) {
    const batch = assignment.batch;

    if (batch.courseId) {
      courseIds.add(batch.courseId);
    }

    for (const row of batch.batchCourses) {
      courseIds.add(row.courseId);
    }
  }

  return courseIds;
}

export async function linkCoursesForAssignedBatches(
  prisma: PrismaService,
  branchId: string,
  batchIds: string[],
): Promise<void> {
  const uniqueBatchIds = [...new Set(batchIds.filter(Boolean))];

  if (uniqueBatchIds.length === 0) {
    return;
  }

  const courseIds = new Set<string>();

  for (const batchId of uniqueBatchIds) {
    const ids = await resolveCourseIdsForBatch(prisma, batchId);
    ids.forEach((id) => courseIds.add(id));
  }

  if (courseIds.size === 0) {
    return;
  }

  const activeCourses = await prisma.course.findMany({
    where: {
      id: { in: [...courseIds] },
      isDeleted: false,
    },
    select: { id: true },
  });

  for (const course of activeCourses) {
    await prisma.courseBranch.upsert({
      where: {
        courseId_branchId: {
          courseId: course.id,
          branchId,
        },
      },
      create: {
        courseId: course.id,
        branchId,
        linkedViaManual: false,
        linkedViaBatch: true,
      },
      update: {
        linkedViaBatch: true,
      },
    });
  }
}

export async function syncCourseLinksAfterBatchUnassign(
  prisma: PrismaService,
  branchId: string,
  batchId: string,
): Promise<void> {
  const removedBatchCourseIds = await resolveCourseIdsForBatch(
    prisma,
    batchId,
  );

  if (removedBatchCourseIds.length === 0) {
    return;
  }

  const stillViaBatch = await resolveCourseIdsForBatchesAtBranch(
    prisma,
    branchId,
    batchId,
  );

  for (const courseId of removedBatchCourseIds) {
    const row = await prisma.courseBranch.findUnique({
      where: {
        courseId_branchId: { courseId, branchId },
      },
    });

    if (!row) {
      continue;
    }

    const batchStillNeedsCourse = stillViaBatch.has(courseId);

    if (batchStillNeedsCourse) {
      continue;
    }

    if (row.linkedViaManual) {
      await prisma.courseBranch.update({
        where: {
          courseId_branchId: { courseId, branchId },
        },
        data: { linkedViaBatch: false },
      });
      continue;
    }

    await prisma.courseBranch.deleteMany({
      where: { courseId, branchId },
    });
  }
}
