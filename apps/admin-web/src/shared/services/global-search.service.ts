import { branchApi } from "@/src/features/branches/api/branch.api";
import { batchApi } from "@/src/features/batches/api/batch.api";
import { batchManagePath } from "@/src/features/batches/utils/batch-manage.routes";
import { categoryService } from "@/src/features/categories/services/category.service";
import { courseService } from "@/src/features/courses/services/course.service";
import { courseManagePath } from "@/src/features/courses/utils/course-manage.routes";
import { enrollmentApi } from "@/src/features/enrollments/api/enrollment.api";
import { enrollmentManagePath } from "@/src/features/enrollments/utils/enrollment-manage.routes";
import { parseEnrollmentListResponse } from "@/src/features/enrollments/utils/enrollment-list.utils";
import { studentApi } from "@/src/features/students/api/student.api";
import { studentManagePath } from "@/src/features/students/utils/student-manage.routes";
import { parseStudentListResponse } from "@/src/features/students/utils/student-list.utils";
import { formatStudentName } from "@/src/features/students/utils/student-overview.utils";
import { trainerService } from "@/src/features/trainers/services/trainer.service";

const GLOBAL_SEARCH_PAGE_SIZE = 5;

export type GlobalSearchEntityType =
  | "student"
  | "batch"
  | "trainer"
  | "branch"
  | "course"
  | "category"
  | "enrollment";

export type GlobalSearchResult = {
  id: string;
  type: GlobalSearchEntityType;
  typeLabel: string;
  title: string;
  subtitle: string;
  href: string;
};

export type GlobalSearchGroup = {
  type: GlobalSearchEntityType;
  typeLabel: string;
  items: GlobalSearchResult[];
};

const ENTITY_ORDER: GlobalSearchEntityType[] = [
  "student",
  "batch",
  "trainer",
  "branch",
  "course",
  "category",
  "enrollment",
];

const TYPE_LABELS: Record<GlobalSearchEntityType, string> = {
  student: "Student",
  batch: "Batch",
  trainer: "Trainer",
  branch: "Branch",
  course: "Course",
  category: "Category",
  enrollment: "Enrollment",
};

function formatPersonName(
  firstName: string,
  lastName: string | null | undefined,
): string {
  return [firstName, lastName].filter(Boolean).join(" ").trim() || "—";
}

function formatTrainerTypeLabel(
  trainerType: string | null | undefined,
): string {
  if (!trainerType) {
    return "Trainer";
  }

  return trainerType
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

async function searchStudents(search: string): Promise<GlobalSearchResult[]> {
  const response = await studentApi.getStudents({
    search,
    page: 1,
    pageSize: GLOBAL_SEARCH_PAGE_SIZE,
    onlyActive: false,
    includeDeleted: false,
  });

  const list = parseStudentListResponse(response.data);

  return list.items.slice(0, GLOBAL_SEARCH_PAGE_SIZE).map((student) => ({
    id: student.id,
    type: "student",
    typeLabel: TYPE_LABELS.student,
    title: formatStudentName(student.firstName, student.lastName),
    subtitle: student.studentCode,
    href: studentManagePath(student.id),
  }));
}

async function searchBatches(search: string): Promise<GlobalSearchResult[]> {
  const response = await batchApi.getBatches({
    search,
    page: 1,
    pageSize: GLOBAL_SEARCH_PAGE_SIZE,
  });

  const items = response.data?.items ?? [];

  return items.slice(0, GLOBAL_SEARCH_PAGE_SIZE).map((batch) => {
    const courseTitle = batch.course?.title?.trim();
    const title =
      batch.name?.trim() ||
      (courseTitle ? `${courseTitle} batch` : "Batch");

    return {
      id: batch.id,
      type: "batch",
      typeLabel: TYPE_LABELS.batch,
      title,
      subtitle: batch.code,
      href: batchManagePath(batch.id),
    };
  });
}

async function searchTrainers(search: string): Promise<GlobalSearchResult[]> {
  const response = await trainerService.getTrainers({
    search,
    page: 1,
    pageSize: GLOBAL_SEARCH_PAGE_SIZE,
    includeDeleted: false,
  });

  const items = response.data?.items ?? [];

  return items.slice(0, GLOBAL_SEARCH_PAGE_SIZE).map((trainer) => ({
    id: trainer.id,
    type: "trainer",
    typeLabel: TYPE_LABELS.trainer,
    title: formatPersonName(trainer.firstName, trainer.lastName),
    subtitle:
      trainer.employeeCode?.trim() ||
      formatTrainerTypeLabel(trainer.trainerType),
    href: `/trainers?trainerId=${encodeURIComponent(trainer.id)}`,
  }));
}

async function searchBranches(search: string): Promise<GlobalSearchResult[]> {
  const response = await branchApi.getBranches({
    search,
    page: 1,
    pageSize: GLOBAL_SEARCH_PAGE_SIZE,
    includeDeleted: false,
    status: undefined,
  });

  const items = response.data?.items ?? [];

  return items.slice(0, GLOBAL_SEARCH_PAGE_SIZE).map((branch) => ({
    id: branch.id,
    type: "branch",
    typeLabel: TYPE_LABELS.branch,
    title: branch.branchName,
    subtitle: branch.branchCode,
    href: `/branches/${branch.id}`,
  }));
}

async function searchCourses(search: string): Promise<GlobalSearchResult[]> {
  const response = await courseService.getCourses({
    search,
    page: 1,
    pageSize: GLOBAL_SEARCH_PAGE_SIZE,
    status: "ACTIVE",
  });

  const items = response.data?.items ?? [];

  return items.slice(0, GLOBAL_SEARCH_PAGE_SIZE).map((course) => ({
    id: course.id,
    type: "course",
    typeLabel: TYPE_LABELS.course,
    title: course.title,
    subtitle: course.code?.trim() || course.slug,
    href: courseManagePath(course.id),
  }));
}

async function searchCategories(search: string): Promise<GlobalSearchResult[]> {
  const response = await categoryService.getCategories({
    search,
    page: 1,
    pageSize: GLOBAL_SEARCH_PAGE_SIZE,
    status: "ACTIVE",
  });

  const items = response.data ?? [];

  return items.slice(0, GLOBAL_SEARCH_PAGE_SIZE).map((category) => ({
    id: category.id,
    type: "category",
    typeLabel: TYPE_LABELS.category,
    title: category.name,
    subtitle: category.slug,
    href: `/categories?categoryId=${encodeURIComponent(category.id)}`,
  }));
}

async function searchEnrollments(
  search: string,
): Promise<GlobalSearchResult[]> {
  const response = await enrollmentApi.getEnrollments({
    search,
    skip: 0,
    take: GLOBAL_SEARCH_PAGE_SIZE,
  });

  const list = parseEnrollmentListResponse(response.data);
  const items = list.items ?? [];

  return items.slice(0, GLOBAL_SEARCH_PAGE_SIZE).map((enrollment) => {
    const studentName = formatPersonName(
      enrollment.student.firstName,
      enrollment.student.lastName,
    );

    return {
      id: enrollment.id,
      type: "enrollment",
      typeLabel: TYPE_LABELS.enrollment,
      title: studentName,
      subtitle:
        enrollment.enrollmentNumber ||
        enrollment.course?.title ||
        enrollment.batch?.name ||
        "Enrollment",
      href: enrollmentManagePath(enrollment.id),
    };
  });
}

function groupResults(results: GlobalSearchResult[]): GlobalSearchGroup[] {
  const byType = new Map<GlobalSearchEntityType, GlobalSearchResult[]>();

  for (const result of results) {
    const existing = byType.get(result.type) ?? [];
    existing.push(result);
    byType.set(result.type, existing);
  }

  return ENTITY_ORDER.filter((type) => byType.has(type)).map((type) => ({
    type,
    typeLabel: TYPE_LABELS[type],
    items: byType.get(type) ?? [],
  }));
}

export async function fetchGlobalSearchResults(
  query: string,
): Promise<GlobalSearchGroup[]> {
  const search = query.trim();

  if (!search) {
    return [];
  }

  const settled = await Promise.allSettled([
    searchStudents(search),
    searchBatches(search),
    searchTrainers(search),
    searchBranches(search),
    searchCourses(search),
    searchCategories(search),
    searchEnrollments(search),
  ]);

  const flat: GlobalSearchResult[] = [];

  for (const result of settled) {
    if (result.status === "fulfilled") {
      flat.push(...result.value);
    }
  }

  return groupResults(flat);
}
