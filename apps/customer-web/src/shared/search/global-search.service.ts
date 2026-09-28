import { batchService } from "@/src/features/batches/services/batch.service";
import { branchService } from "@/src/features/branches/services/branch.service";
import {
  formatBranchLocation,
  getBranchDetailPath,
} from "@/src/features/branches/utils/branch.utils";
import { getCategories } from "@/src/features/categories/services/category.service";
import { getCourses } from "@/src/features/courses/services/course.service";
import { getCourseDetailPath } from "@/src/features/courses/utils/course-route.utils";
import { listFinancialArticles } from "@/src/features/finance-news/services/finance-news.service";
import { trainerService } from "@/src/features/trainers/services/trainer.service";

import {
  GLOBAL_SEARCH_MIN_QUERY_LENGTH,
  GLOBAL_SEARCH_RESULTS_PER_GROUP,
} from "@/src/shared/search/global-search.constants";

import type {
  GlobalSearchGroup,
  GlobalSearchItem,
  GlobalSearchResult,
} from "@/src/shared/search/global-search.types";

function limit<T>(items: T[], count: number): T[] {
  return items.slice(0, count);
}

async function safe<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch {
    return fallback;
  }
}

export async function searchCustomerGlobal(
  rawQuery: string,
): Promise<GlobalSearchResult> {
  const query = rawQuery.trim();

  if (query.length < GLOBAL_SEARCH_MIN_QUERY_LENGTH) {
    return { query, groups: [] };
  }

  const take = GLOBAL_SEARCH_RESULTS_PER_GROUP;

  const [
    courses,
    branches,
    trainers,
    batches,
    categories,
    financialArticles,
  ] = await Promise.all([
    safe(getCourses({ search: query, take, skip: 0 }), []),
    safe(branchService.getBranches(query), []),
    safe(trainerService.getTrainers({ search: query, take, skip: 0 }), []),
    safe(batchService.getBatches({ search: query, take, skip: 0 }), []),
    safe(getCategories({ search: query }), []),
    safe(
      listFinancialArticles({ search: query, take, skip: 0 }).then(
        (result) => result.items,
      ),
      [],
    ),
  ]);

  const groups: GlobalSearchGroup[] = [];

  const courseItems: GlobalSearchItem[] = limit(courses, take).map((course) => ({
    id: course.id,
    type: "course",
    title: course.title,
    subtitle: course.categoryName || course.tagline || undefined,
    imageUrl: course.thumbnailUrl,
    href: getCourseDetailPath(course),
  }));

  if (courseItems.length > 0) {
    groups.push({ type: "course", label: "Courses", items: courseItems });
  }

  const branchItems: GlobalSearchItem[] = limit(branches, take).map((branch) => ({
    id: branch.id,
    type: "branch",
    title: branch.branchName,
    subtitle: formatBranchLocation(branch) || branch.branchCode,
    imageUrl: branch.thumbnailUrl,
    href: getBranchDetailPath(branch),
  }));

  if (branchItems.length > 0) {
    groups.push({ type: "branch", label: "Branches", items: branchItems });
  }

  const trainerItems: GlobalSearchItem[] = limit(trainers, take).map(
    (trainer) => ({
      id: trainer.id,
      type: "trainer",
      title: `${trainer.firstName} ${trainer.lastName}`.trim(),
      subtitle:
        trainer.specialization ||
        trainer.qualification ||
        (trainer.experienceYears
          ? `${trainer.experienceYears}+ years experience`
          : undefined),
      imageUrl: trainer.profileImageUrl,
      href: `/trainers/${trainer.id}`,
    }),
  );

  if (trainerItems.length > 0) {
    groups.push({ type: "trainer", label: "Trainers", items: trainerItems });
  }

  const batchItems: GlobalSearchItem[] = limit(batches, take).map((batch) => ({
    id: batch.id,
    type: "batch",
    title: batch.name,
    subtitle: [batch.course?.title, batch.branch?.branchName]
      .filter(Boolean)
      .join(" · "),
    imageUrl: null,
    href: `/batch/${batch.id}`,
  }));

  if (batchItems.length > 0) {
    groups.push({ type: "batch", label: "Batches", items: batchItems });
  }

  const categoryItems: GlobalSearchItem[] = limit(categories, take).map(
    (category) => ({
      id: category.id,
      type: "category",
      title: category.name,
      subtitle:
        category.courseCount != null
          ? `${category.courseCount} course${category.courseCount === 1 ? "" : "s"}`
          : category.description?.slice(0, 80),
      imageUrl: category.thumbnailUrl,
      href: `/courses?category=${encodeURIComponent(category.slug)}`,
    }),
  );

  if (categoryItems.length > 0) {
    groups.push({
      type: "category",
      label: "Categories",
      items: categoryItems,
    });
  }

  const articleItems: GlobalSearchItem[] = limit(financialArticles, take).map(
    (article) => ({
      id: article.id,
      type: "financial-article",
      title: article.title,
      subtitle: article.authorName || article.category?.name,
      imageUrl: article.thumbnailUrl,
      href: `/finance-news/${encodeURIComponent(article.slug)}`,
    }),
  );

  if (articleItems.length > 0) {
    groups.push({
      type: "financial-article",
      label: "Financial News",
      items: articleItems,
    });
  }

  return { query, groups };
}
