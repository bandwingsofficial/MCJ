import type { CategoryListItem } from "@/src/features/categories/types/category.types";

export type CategoryDependencySummary = {
  removable: {
    branches: number;
    courses: number;
    enrollments: number;
    articles: number;
  };
  blocking: {
    branches: number;
    courses: number;
    enrollments: number;
    articles: number;
  };
  blockingCourseNames: string[];
  canDeactivate: boolean;
  canArchive: boolean;
};

export function isCategoryDeactivateAllowed(
  summary: CategoryDependencySummary | null,
  loading: boolean,
): boolean {
  if (loading || !summary) {
    return false;
  }

  return summary.canDeactivate === true;
}

export function isCategoryArchiveAllowed(
  summary: CategoryDependencySummary | null,
  loading: boolean,
): boolean {
  if (loading || !summary) {
    return false;
  }

  return summary.canArchive === true;
}

function formatCourseBlockMessage(
  courseNames: string[],
  courseCount: number,
  action: "deactivate" | "archive",
): string {
  const verb = action === "deactivate" ? "deactivating" : "archiving";

  if (courseNames.length > 0) {
    return [
      "This category is currently used by:",
      ...courseNames.map((name) => `• ${name}`),
      `Remove the category from these courses before ${verb} it.`,
    ].join("\n");
  }

  if (courseCount === 1) {
    return `This category is currently used by 1 course. Remove the category from that course before ${verb} it.`;
  }

  return `This category is currently used by ${courseCount} courses. Remove the category from those courses before ${verb} it.`;
}

export function buildDeactivateDescription(
  summary: CategoryDependencySummary | null,
  loading: boolean,
): string {
  if (loading) {
    return "Checking category dependencies...";
  }

  if (!summary) {
    return "Unable to verify category dependencies. Please try again.";
  }

  if (!summary.canDeactivate) {
    return formatCourseBlockMessage(
      summary.blockingCourseNames.filter(Boolean),
      summary.blocking.courses,
      "deactivate",
    );
  }

  const branchCount = summary.removable.branches;

  if (branchCount > 0) {
    return `Are you sure you want to deactivate this category?\n\nIt is assigned to ${branchCount} branch${branchCount === 1 ? "" : "es"}. Deactivating will remove those branch assignments.`;
  }

  return "Are you sure you want to deactivate this category?";
}

export function buildArchiveDescription(
  summary: CategoryDependencySummary | null,
  loading: boolean,
): string {
  if (loading) {
    return "Checking category dependencies...";
  }

  if (!summary) {
    return "Unable to verify category dependencies. Please try again.";
  }

  if (!summary.canArchive) {
    return formatCourseBlockMessage(
      summary.blockingCourseNames.filter(Boolean),
      summary.blocking.courses,
      "archive",
    );
  }

  const branchCount = summary.removable.branches;

  if (branchCount > 0) {
    return `Are you sure you want to archive this category?\n\nIt is assigned to ${branchCount} branch${branchCount === 1 ? "" : "es"}. Archiving will remove those branch assignments. This category will remain available for restoration.`;
  }

  return "Are you sure you want to archive this category? It will remain available for restoration.";
}

export function buildPermanentDeleteDescription(): string {
  return "This action cannot be undone. Are you sure you want to permanently delete this category?";
}

export type CategoryDependencyApiData = {
  removable: CategoryDependencySummary["removable"];
  blocking: CategoryDependencySummary["blocking"];
  blockingCourseNames?: string[];
  canDeactivate?: boolean;
  canArchive?: boolean;
};

export function parseCategoryDependencySummary(
  data: CategoryDependencyApiData,
): CategoryDependencySummary {
  const coursesClear = data.blocking.courses === 0;

  return {
    removable: data.removable,
    blocking: data.blocking,
    blockingCourseNames: data.blockingCourseNames ?? [],
    canDeactivate: data.canDeactivate ?? coursesClear,
    canArchive:
      data.canArchive ?? data.canDeactivate ?? coursesClear,
  };
}

export type BulkCategoryCourseBlock = {
  categoryName: string;
  courseNames: string[];
};

export type LoadCategoryDependencySummary = (
  categoryId: string,
) => Promise<CategoryDependencySummary>;

export async function collectBulkCourseBlocks(
  categories: CategoryListItem[],
  categoryIds: string[],
  loadSummary: LoadCategoryDependencySummary,
  mode: "deactivate" | "archive",
): Promise<BulkCategoryCourseBlock[]> {
  const byId = new Map(categories.map((category) => [category.id, category]));
  const blocks = (
    await Promise.all(
      categoryIds.map(async (categoryId) => {
        const summary = await loadSummary(categoryId);
        const allowed =
          mode === "deactivate"
            ? isCategoryDeactivateAllowed(summary, false)
            : isCategoryArchiveAllowed(summary, false);

        if (allowed) {
          return null;
        }

        const category = byId.get(categoryId);
        const courseNames = summary.blockingCourseNames.filter(Boolean);

        return {
          categoryName: category?.name ?? "Unknown category",
          courseNames:
            courseNames.length > 0
              ? courseNames
              : summary.blocking.courses > 0
                ? [`${summary.blocking.courses} course(s)`]
                : [],
        } satisfies BulkCategoryCourseBlock;
      }),
    )
  ).filter((entry): entry is BulkCategoryCourseBlock => entry !== null);

  blocks.sort((left, right) =>
    left.categoryName.localeCompare(right.categoryName),
  );

  return blocks;
}

function formatBulkCourseBlockedBody(
  entries: BulkCategoryCourseBlock[],
  action: "deactivate" | "archive",
): string {
  const intro =
    action === "deactivate"
      ? "Some selected categories are currently being used by courses:"
      : "Some selected categories are currently being used by courses:";

  const lines = entries.flatMap((entry) => {
    const categoryLine = `• ${entry.categoryName}`;
    if (entry.courseNames.length === 0) {
      return [categoryLine];
    }

    return [
      categoryLine,
      ...entry.courseNames.map((course) => `  - ${course}`),
    ];
  });

  const footer =
    action === "deactivate"
      ? "Remove these categories from the listed courses before deactivating them."
      : "Remove these categories from the listed courses before archiving them.";

  return [intro, "", ...lines, "", footer].join("\n");
}

export function buildBulkDeactivateBlockedDescription(
  entries: BulkCategoryCourseBlock[],
): string {
  return formatBulkCourseBlockedBody(entries, "deactivate");
}

export function buildBulkArchiveBlockedDescription(
  entries: BulkCategoryCourseBlock[],
): string {
  return formatBulkCourseBlockedBody(entries, "archive");
}

export function buildBulkDeactivateConfirmDescription(): string {
  return "Are you sure you want to deactivate the selected categories?";
}

export function buildBulkArchiveConfirmDescription(): string {
  return "Are you sure you want to archive the selected categories?";
}
