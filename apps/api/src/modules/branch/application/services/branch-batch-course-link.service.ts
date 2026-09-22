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

  await reconcileCourseBranchLinksForBranch(prisma, branchId);
}

export async function resolveActiveCourseIdsForBranch(
  prisma: PrismaService,
  branchId: string,
): Promise<Set<string>> {
  const batchCourseIds = await resolveCourseIdsForBatchesAtBranch(
    prisma,
    branchId,
  );

  const rows = await prisma.courseBranch.findMany({
    where: {
      branchId,
      course: { isDeleted: false },
    },
    select: {
      courseId: true,
      manualAssignedAt: true,
    },
  });

  const courseIds = new Set<string>();

  for (const row of rows) {
    if (batchCourseIds.has(row.courseId) || row.manualAssignedAt) {
      courseIds.add(row.courseId);
    }
  }

  return courseIds;
}

export async function resolveDerivedCategoryIdsForBranch(
  prisma: PrismaService,
  branchId: string,
): Promise<Set<string>> {
  const activeCourseIds = await resolveActiveCourseIdsForBranch(
    prisma,
    branchId,
  );

  if (activeCourseIds.size === 0) {
    return new Set();
  }

  const courses = await prisma.course.findMany({
    where: {
      id: { in: [...activeCourseIds] },
      isDeleted: false,
    },
    select: { categoryId: true },
  });

  const categoryIds = new Set<string>();

  for (const course of courses) {
    if (course.categoryId) {
      categoryIds.add(course.categoryId);
    }
  }

  return categoryIds;
}

/**
 * Branch → Course links must match assigned batches plus explicit manual assigns.
 */
export async function reconcileCourseBranchLinksForBranch(
  prisma: PrismaService,
  branchId: string,
): Promise<void> {
  const batchCourseIds = await resolveCourseIdsForBatchesAtBranch(
    prisma,
    branchId,
  );

  const rows = await prisma.courseBranch.findMany({
    where: { branchId },
    select: {
      courseId: true,
      linkedViaBatch: true,
      manualAssignedAt: true,
    },
  });

  for (const row of rows) {
    const onAssignedBatch = batchCourseIds.has(row.courseId);
    const manualLink = Boolean(row.manualAssignedAt);

    if (onAssignedBatch) {
      if (!row.linkedViaBatch) {
        await prisma.courseBranch.update({
          where: {
            courseId_branchId: {
              courseId: row.courseId,
              branchId,
            },
          },
          data: { linkedViaBatch: true },
        });
      }
      continue;
    }

    if (manualLink) {
      if (row.linkedViaBatch) {
        await prisma.courseBranch.update({
          where: {
            courseId_branchId: {
              courseId: row.courseId,
              branchId,
            },
          },
          data: { linkedViaBatch: false },
        });
      }
      continue;
    }

    await prisma.courseBranch.deleteMany({
      where: { branchId, courseId: row.courseId },
    });
  }

  await syncBranchCategoryLinksForBranch(prisma, branchId);
}

/**
 * BranchCategory rows with linkedViaManual=false are legacy/duplicate derived joins.
 * Derived categories are computed from CourseBranch → Course.categoryId; remove stale rows.
 */
export async function syncBranchCategoryLinksForBranch(
  prisma: PrismaService,
  branchId: string,
): Promise<void> {
  await prisma.branchCategory.deleteMany({
    where: {
      branchId,
      linkedViaManual: false,
    },
  });
}

export async function syncCourseLinksAfterBatchUnassign(
  prisma: PrismaService,
  branchId: string,
  _batchId: string,
): Promise<void> {
  await reconcileCourseBranchLinksForBranch(prisma, branchId);
}
