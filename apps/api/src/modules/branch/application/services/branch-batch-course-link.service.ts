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

export async function resolveManualCategoryIdsAtBranch(
  prisma: PrismaService,
  branchId: string,
): Promise<Set<string>> {
  const rows = await prisma.branchCategory.findMany({
    where: {
      branchId,
      linkedViaManual: true,
      category: {
        isDeleted: false,
        status: 'ACTIVE',
      },
    },
    select: { categoryId: true },
  });

  return new Set(rows.map((row) => row.categoryId));
}

export async function resolveCourseIdsForManualCategoriesAtBranch(
  prisma: PrismaService,
  branchId: string,
): Promise<Set<string>> {
  const categoryIds = await resolveManualCategoryIdsAtBranch(
    prisma,
    branchId,
  );

  if (categoryIds.size === 0) {
    return new Set();
  }

  const courses = await prisma.course.findMany({
    where: {
      categoryId: { in: [...categoryIds] },
      isDeleted: false,
    },
    select: { id: true },
  });

  return new Set(courses.map((course) => course.id));
}

async function upsertBatchCourseLinks(
  prisma: PrismaService,
  branchId: string,
  batchCourseIds: Set<string>,
): Promise<void> {
  if (batchCourseIds.size === 0) {
    return;
  }

  const activeCourses = await prisma.course.findMany({
    where: {
      id: { in: [...batchCourseIds] },
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
        linkedViaCategory: false,
      },
      update: {
        linkedViaBatch: true,
      },
    });
  }
}

async function upsertCategoryCourseLinks(
  prisma: PrismaService,
  branchId: string,
  categoryCourseIds: Set<string>,
): Promise<void> {
  if (categoryCourseIds.size === 0) {
    return;
  }

  const activeCourses = await prisma.course.findMany({
    where: {
      id: { in: [...categoryCourseIds] },
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
        linkedViaBatch: false,
        linkedViaCategory: true,
      },
      update: {
        linkedViaCategory: true,
      },
    });
  }
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

  await upsertBatchCourseLinks(prisma, branchId, courseIds);
  await reconcileCourseBranchLinksForBranch(prisma, branchId);
}

export async function linkCoursesForAssignedCategories(
  prisma: PrismaService,
  branchId: string,
  categoryIds: string[],
): Promise<void> {
  const uniqueCategoryIds = [...new Set(categoryIds.filter(Boolean))];

  if (uniqueCategoryIds.length === 0) {
    return;
  }

  const courses = await prisma.course.findMany({
    where: {
      categoryId: { in: uniqueCategoryIds },
      isDeleted: false,
    },
    select: { id: true },
  });

  const courseIds = new Set(courses.map((course) => course.id));
  await upsertCategoryCourseLinks(prisma, branchId, courseIds);
  await reconcileCourseBranchLinksForBranch(prisma, branchId);
}

export async function resolveActiveCourseIdsForBranch(
  prisma: PrismaService,
  branchId: string,
): Promise<Set<string>> {
  const [batchCourseIds, categoryCourseIds] = await Promise.all([
    resolveCourseIdsForBatchesAtBranch(prisma, branchId),
    resolveCourseIdsForManualCategoriesAtBranch(prisma, branchId),
  ]);

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
    if (
      batchCourseIds.has(row.courseId) ||
      categoryCourseIds.has(row.courseId) ||
      row.manualAssignedAt
    ) {
      courseIds.add(row.courseId);
    }
  }

  for (const courseId of batchCourseIds) {
    courseIds.add(courseId);
  }

  for (const courseId of categoryCourseIds) {
    courseIds.add(courseId);
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
 * Branch → Course links must match assigned batches, manual category assigns, and explicit manual assigns.
 */
export async function reconcileCourseBranchLinksForBranch(
  prisma: PrismaService,
  branchId: string,
): Promise<void> {
  const [batchCourseIds, categoryCourseIds] = await Promise.all([
    resolveCourseIdsForBatchesAtBranch(prisma, branchId),
    resolveCourseIdsForManualCategoriesAtBranch(prisma, branchId),
  ]);

  await upsertBatchCourseLinks(prisma, branchId, batchCourseIds);
  await upsertCategoryCourseLinks(prisma, branchId, categoryCourseIds);

  const rows = await prisma.courseBranch.findMany({
    where: { branchId },
    select: {
      courseId: true,
      linkedViaManual: true,
      linkedViaBatch: true,
      linkedViaCategory: true,
      manualAssignedAt: true,
    },
  });

  for (const row of rows) {
    const onAssignedBatch = batchCourseIds.has(row.courseId);
    const onAssignedCategory = categoryCourseIds.has(row.courseId);
    const manualLink = Boolean(row.manualAssignedAt);
    const linkedViaManual = manualLink;

    if (onAssignedBatch || onAssignedCategory || manualLink) {
      const data: {
        linkedViaBatch?: boolean;
        linkedViaCategory?: boolean;
        linkedViaManual?: boolean;
      } = {};

      if (row.linkedViaBatch !== onAssignedBatch) {
        data.linkedViaBatch = onAssignedBatch;
      }

      if (row.linkedViaCategory !== onAssignedCategory) {
        data.linkedViaCategory = onAssignedCategory;
      }

      if (row.linkedViaManual !== linkedViaManual) {
        data.linkedViaManual = linkedViaManual;
      }

      if (Object.keys(data).length > 0) {
        await prisma.courseBranch.update({
          where: {
            courseId_branchId: {
              courseId: row.courseId,
              branchId,
            },
          },
          data,
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

export async function reconcileCourseBranchLinksForBatch(
  prisma: PrismaService,
  batchId: string,
): Promise<void> {
  const assignments = await prisma.branchBatch.findMany({
    where: { batchId },
    select: { branchId: true },
  });

  const branchIds = [...new Set(assignments.map((row) => row.branchId))];

  for (const branchId of branchIds) {
    await reconcileCourseBranchLinksForBranch(prisma, branchId);
  }
}
