"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Eye,
  Plus,
  Trash2,
} from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { Skeleton } from "@/src/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/shared/components/ui/table";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import type { BranchSummaryCounts } from "@/src/features/branches/hooks/use-branch-summary";
import { branchService } from "@/src/features/branches/services/branch.service";
import {
  AssignEntitiesModal,
  type AssignableItem,
} from "@/src/features/branches/components/manage/assign-entities-modal";
import { BranchIconAction } from "@/src/features/branches/components/manage/branch-icon-action";
import { BranchOverviewMetricCards } from "@/src/features/branches/components/manage/branch-overview-metric-cards";
import { BranchOverviewSectionHeader } from "@/src/features/branches/components/manage/branch-overview-section-header";
import {
  formatCourseDuration,
  formatCourseLevel,
  formatCoursePrice,
  formatPersonName,
  formatTrainerNames,
  truncateText,
} from "@/src/features/branches/utils/branch-display.utils";
import { batchService } from "@/src/features/batches/services/batch.service";
import { BatchStatusBadge } from "@/src/features/batches/components/BatchStatusBadge";
import type { Batch } from "@/src/features/batches/types/batch.types";
import { useDeleteBatch } from "@/src/features/batches/hooks/useDeleteBatch";
import { categoryService } from "@/src/features/categories/services/category.service";
import { CategoryStatusBadge } from "@/src/features/categories/components/category-status-badge";
import type { CategoryListItem } from "@/src/features/categories/types/category.types";
import { CourseStatusBadge } from "@/src/features/courses/components/course-status-badge";
import { courseService } from "@/src/features/courses/services/course.service";
import type { CourseListItem } from "@/src/features/courses/types/course.types";
import { enrollmentService } from "@/src/features/enrollments/services/enrollment.service";
import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";
import { parseEnrollmentListResponse } from "@/src/features/enrollments/utils/enrollment-list.utils";
import { StudentEnrollmentActiveBadge } from "@/src/features/students/components/manage/student-enrollment-active-badge";
import { StudentStatusBadge } from "@/src/features/students/components/StudentStatusBadge";
import { studentService } from "@/src/features/students/services/student.service";
import type { StudentListItem } from "@/src/features/students/types/student.types";
import { parseStudentListResponse } from "@/src/features/students/utils/student-list.utils";
import { formatStudentDate } from "@/src/features/students/utils/student-form.utils";
import { isArchivedStudent } from "@/src/features/students/utils/student-bulk.utils";

const OVERVIEW_CATEGORY_LIMIT = 8;
const OVERVIEW_COURSE_LIMIT = 6;
const OVERVIEW_BATCH_LIMIT = 5;
const OVERVIEW_RECENT_LIMIT = 5;

export type BranchManageTabKey =
  | "overview"
  | "users"
  | "categories"
  | "courses"
  | "batches"
  | "students"
  | "enrollments"
  | "instructors"
  | "reports";

interface Props {
  branchId: string;
  summary: BranchSummaryCounts | null;
  summaryLoading?: boolean;
  assignmentsDisabled?: boolean;
  onSummaryRefresh?: () => Promise<void>;
  onNavigateToTab: (tab: BranchManageTabKey) => void;
}

function getInitials(firstName?: string | null, lastName?: string | null): string {
  const first = firstName?.trim().charAt(0) ?? "";
  const last = lastName?.trim().charAt(0) ?? "";
  const initials = `${first}${last}`.toUpperCase();

  return initials || "?";
}

function formatBatchLabel(name?: string | null, code?: string | null): string {
  if (!name) {
    return "—";
  }

  return code ? `${name} (${code})` : name;
}

function SectionCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm ${className ?? ""}`}
    >
      {children}
    </Card>
  );
}

function HorizontalCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex gap-3 overflow-hidden">
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton
          key={index}
          className="h-44 w-64 shrink-0 rounded-xl"
        />
      ))}
    </div>
  );
}

export function BranchManageOverviewPanel({
  branchId,
  summary,
  summaryLoading = false,
  assignmentsDisabled = false,
  onSummaryRefresh,
  onNavigateToTab,
}: Props) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<CategoryListItem[]>([]);
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courseCountByCategory, setCourseCountByCategory] = useState<
    Record<string, number>
  >({});
  const [batchCountByCategory, setBatchCountByCategory] = useState<
    Record<string, number>
  >({});
  const [batchCountByCourse, setBatchCountByCourse] = useState<
    Record<string, number>
  >({});
  const [enrollmentCountByStudent, setEnrollmentCountByStudent] = useState<
    Record<string, number>
  >({});

  const [assignKind, setAssignKind] = useState<"categories" | "courses" | null>(
    null,
  );
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignSearch, setAssignSearch] = useState("");
  const [assignCandidates, setAssignCandidates] = useState<AssignableItem[]>(
    [],
  );
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignSubmitting, setAssignSubmitting] = useState(false);

  const [unassignTarget, setUnassignTarget] = useState<{
    kind: "categories" | "courses";
    id: string;
    label: string;
  } | null>(null);
  const [unassignLoading, setUnassignLoading] = useState(false);

  const [deleteBatchTarget, setDeleteBatchTarget] = useState<Batch | null>(
    null,
  );
  const { deleteBatch, isLoading: isDeletingBatch } = useDeleteBatch();

  const loadOverviewData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        categoryResponse,
        courseResponse,
        batchResponse,
        studentResponse,
        enrollmentResponse,
      ] = await Promise.all([
        categoryService.getCategories({
          search: "",
          status: "ACTIVE",
          branchId,
          page: 1,
          pageSize: 100,
        }),
        courseService.getCourses({
          branchId,
          page: 1,
          pageSize: 100,
        }),
        batchService.getBatches({
          branchId,
          includeDeleted: false,
          page: 1,
          pageSize: 100,
        }),
        studentService.getStudents({
          branchId,
          includeDeleted: false,
          page: 1,
          pageSize: OVERVIEW_RECENT_LIMIT,
        }),
        enrollmentService.getEnrollments({
          branchId,
          skip: 0,
          take: OVERVIEW_RECENT_LIMIT,
        }),
      ]);

      const categoryItems = (categoryResponse.data ?? []).filter(
        (item) => !item.isDeleted && item.status === "ACTIVE",
      );
      const courseItems = courseResponse.data.items ?? [];
      const batchItems = batchResponse.data.items ?? [];
      const studentPayload = parseStudentListResponse(studentResponse.data);
      const enrollmentPayload = parseEnrollmentListResponse(enrollmentResponse);

      setCategories(categoryItems);
      setCourses(courseItems);
      setBatches(batchItems);
      setStudents(studentPayload.items);
      setEnrollments(enrollmentPayload.items);

      const courseCounts: Record<string, number> = {};
      const batchByCourse: Record<string, number> = {};
      const batchByCategory: Record<string, number> = {};
      const courseCategoryMap = new Map(
        courseItems.map((course) => [course.id, course.categoryId]),
      );

      for (const course of courseItems) {
        if (course.categoryId) {
          courseCounts[course.categoryId] =
            (courseCounts[course.categoryId] ?? 0) + 1;
        }
      }

      for (const batch of batchItems) {
        batchByCourse[batch.courseId] =
          (batchByCourse[batch.courseId] ?? 0) + 1;
        const categoryId = courseCategoryMap.get(batch.courseId);
        if (categoryId) {
          batchByCategory[categoryId] =
            (batchByCategory[categoryId] ?? 0) + 1;
        }
      }

      const enrollmentCounts: Record<string, number> = {};
      for (const enrollment of enrollmentPayload.items) {
        const studentId = enrollment.student?.id;
        if (studentId) {
          enrollmentCounts[studentId] =
            (enrollmentCounts[studentId] ?? 0) + 1;
        }
      }

      setCourseCountByCategory(courseCounts);
      setBatchCountByCategory(batchByCategory);
      setBatchCountByCourse(batchByCourse);
      setEnrollmentCountByStudent(enrollmentCounts);
    } catch (error) {
      appToast.error(getErrorMessage(error));
      setCategories([]);
      setCourses([]);
      setBatches([]);
      setStudents([]);
      setEnrollments([]);
    } finally {
      setIsLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    void loadOverviewData();
  }, [loadOverviewData]);

  const visibleCategories = useMemo(
    () => categories.slice(0, OVERVIEW_CATEGORY_LIMIT),
    [categories],
  );
  const visibleCourses = useMemo(
    () => courses.slice(0, OVERVIEW_COURSE_LIMIT),
    [courses],
  );
  const visibleBatches = useMemo(
    () => batches.slice(0, OVERVIEW_BATCH_LIMIT),
    [batches],
  );

  const openAssign = async (kind: "categories" | "courses") => {
    setAssignKind(kind);
    setAssignOpen(true);
    setAssignSearch("");
    setAssignLoading(true);

    try {
      if (kind === "categories") {
        const response = await categoryService.getCategories({
          search: "",
          status: "ACTIVE",
          page: 1,
          pageSize: 200,
        });
        const assignedIds = new Set(categories.map((item) => item.id));
        setAssignCandidates(
          (response.data ?? [])
            .filter(
              (item) =>
                !item.isDeleted &&
                item.status === "ACTIVE" &&
                !assignedIds.has(item.id),
            )
            .map((item) => ({
              id: item.id,
              label: item.name,
              meta: item.status,
              imageUrl: item.thumbnailUrl,
            })),
        );
      } else {
        const response = await courseService.getCourses({
          page: 1,
          pageSize: 200,
        });
        const assigned = new Set(courses.map((course) => course.id));
        setAssignCandidates(
          (response.data.items ?? [])
            .filter((item) => !assigned.has(item.id))
            .map((item) => ({
              id: item.id,
              label: item.title,
              meta: item.code,
            })),
        );
      }
    } catch (error) {
      appToast.error(getErrorMessage(error));
      setAssignOpen(false);
    } finally {
      setAssignLoading(false);
    }
  };

  const handleAssign = async (ids: string[]) => {
    if (!assignKind || ids.length === 0) {
      return;
    }

    setAssignSubmitting(true);
    try {
      if (assignKind === "categories") {
        await branchService.assignCategories(branchId, ids);
        appToast.success("Categories assigned");
      } else {
        for (const id of ids) {
          const detail = await courseService.getCourse(id);
          const existing =
            detail.data.branches?.map((branch) => branch.id) ?? [];
          const next = Array.from(new Set([...existing, branchId]));
          await courseService.updateCourse(id, { branchIds: next });
        }
        appToast.success("Courses assigned");
      }

      setAssignOpen(false);
      setAssignKind(null);
      await loadOverviewData();
      await onSummaryRefresh?.();
    } catch (error) {
      appToast.error(getErrorMessage(error));
    } finally {
      setAssignSubmitting(false);
    }
  };

  const handleUnassign = async () => {
    if (!unassignTarget) {
      return;
    }

    setUnassignLoading(true);
    try {
      if (unassignTarget.kind === "categories") {
        await branchService.unassignCategory(branchId, unassignTarget.id);
        appToast.success("Category unassigned");
      } else {
        const detail = await courseService.getCourse(unassignTarget.id);
        const existing =
          detail.data.branches?.map((branch) => branch.id) ?? [];
        await courseService.updateCourse(unassignTarget.id, {
          branchIds: existing.filter((id) => id !== branchId),
        });
        appToast.success("Course unassigned");
      }

      setUnassignTarget(null);
      await loadOverviewData();
      await onSummaryRefresh?.();
    } catch (error) {
      appToast.error(getErrorMessage(error));
    } finally {
      setUnassignLoading(false);
    }
  };

  const handleDeleteBatch = async () => {
    if (!deleteBatchTarget) {
      return;
    }

    try {
      await deleteBatch(deleteBatchTarget.id);
      appToast.success("Batch archived");
      setDeleteBatchTarget(null);
      await loadOverviewData();
      await onSummaryRefresh?.();
    } catch (error) {
      appToast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <SectionCard>
        <BranchOverviewSectionHeader
          title="Categories"
          onViewAll={() => onNavigateToTab("categories")}
          actionLabel="Assign Categories"
          onAction={() => {
            void openAssign("categories");
          }}
          actionDisabled={assignmentsDisabled}
        />

        {isLoading ? (
          <HorizontalCardSkeleton count={4} />
        ) : visibleCategories.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-10 text-center">
            <p className="text-sm font-medium text-slate-700">
              No categories assigned
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Assign categories to organize courses for this branch.
            </p>
            <Button
              type="button"
              size="sm"
              className="mt-4"
              disabled={assignmentsDisabled}
              onClick={() => {
                void openAssign("categories");
              }}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Assign Categories
            </Button>
          </div>
        ) : (
          <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
            {visibleCategories.map((category) => (
              <div
                key={category.id}
                className="w-64 shrink-0 rounded-xl border border-slate-200 bg-slate-50/40 p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white">
                    {category.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={category.thumbnailUrl}
                        alt={category.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-medium text-slate-400">
                        CAT
                      </span>
                    )}
                  </div>
                  <BranchIconAction
                    icon={Trash2}
                    label="Unassign Category"
                    destructive
                    disabled={assignmentsDisabled}
                    onClick={() =>
                      setUnassignTarget({
                        kind: "categories",
                        id: category.id,
                        label: category.name,
                      })
                    }
                  />
                </div>
                <div className="mt-3">
                  <p className="truncate font-semibold text-slate-900">
                    {category.name}
                  </p>
                  <div className="mt-1">
                    <CategoryStatusBadge status={category.status} />
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs text-slate-500">
                    {truncateText(category.description, 90)}
                  </p>
                  <div className="mt-3 flex gap-3 text-xs text-slate-600">
                    <span>
                      {courseCountByCategory[category.id] ?? 0} courses
                    </span>
                    <span>
                      {batchCountByCategory[category.id] ?? 0} batches
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard>
        <BranchOverviewSectionHeader
          title="Courses"
          onViewAll={() => onNavigateToTab("courses")}
          actionLabel="Assign Course"
          onAction={() => {
            void openAssign("courses");
          }}
          actionDisabled={assignmentsDisabled}
        />

        {isLoading ? (
          <HorizontalCardSkeleton count={3} />
        ) : visibleCourses.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-10 text-center">
            <p className="text-sm font-medium text-slate-700">
              No courses assigned
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Assign courses that belong to this branch.
            </p>
            <Button
              type="button"
              size="sm"
              className="mt-4"
              disabled={assignmentsDisabled}
              onClick={() => {
                void openAssign("courses");
              }}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Assign Course
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {visibleCourses.map((course) => (
              <div
                key={course.id}
                className="rounded-xl border border-slate-200 bg-slate-50/40 p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                    <BookOpen className="h-5 w-5 text-[#2447A8]" />
                  </div>
                  <div className="flex items-center gap-1">
                    <BranchIconAction
                      icon={Eye}
                      label="View"
                      href={`/courses/${course.id}/preview`}
                    />
                    <BranchIconAction
                      icon={Trash2}
                      label="Unassign Course"
                      destructive
                      disabled={assignmentsDisabled}
                      onClick={() =>
                        setUnassignTarget({
                          kind: "courses",
                          id: course.id,
                          label: course.title,
                        })
                      }
                    />
                  </div>
                </div>
                <p className="mt-3 font-mono text-xs text-slate-500">
                  {course.code}
                </p>
                <p className="mt-1 font-semibold text-slate-900">
                  {course.title}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {course.category?.name ??
                    course.categoryName ??
                    "No Category"}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>{formatCourseLevel(course.level)}</span>
                  <span>·</span>
                  <span>
                    {formatCourseDuration(
                      course.duration,
                      course.durationType,
                    )}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900">
                    {formatCoursePrice(course)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {batchCountByCourse[course.id] ?? 0} batches
                  </p>
                </div>
                <div className="mt-2">
                  <CourseStatusBadge status={course.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard>
        <BranchOverviewSectionHeader
          title="Batches"
          onViewAll={() => onNavigateToTab("batches")}
          actionLabel="Create Batch"
          onAction={() => {
            router.push(`/batches/create?branchId=${branchId}`);
          }}
          showAction
        />

        {isLoading ? (
          <Skeleton className="h-48 w-full rounded-xl" />
        ) : visibleBatches.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-10 text-center">
            <p className="text-sm font-medium text-slate-700">No batches yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Create a batch for a course at this branch.
            </p>
            <Button
              type="button"
              size="sm"
              className="mt-4"
              onClick={() => {
                router.push(`/batches/create?branchId=${branchId}`);
              }}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Create Batch
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch Code</TableHead>
                  <TableHead>Batch Name</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Trainer(s)</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleBatches.map((batch) => (
                  <TableRow key={batch.id}>
                    <TableCell className="font-mono text-sm text-slate-700">
                      {batch.code || "—"}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">
                      {batch.name}
                    </TableCell>
                    <TableCell>{batch.course?.title ?? "—"}</TableCell>
                    <TableCell className="max-w-[180px] truncate">
                      {formatTrainerNames(batch.trainers ?? [])}
                    </TableCell>
                    <TableCell>{formatStudentDate(batch.startDate)}</TableCell>
                    <TableCell>{formatStudentDate(batch.endDate)}</TableCell>
                    <TableCell>
                      <BatchStatusBadge status={batch.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <BranchIconAction
                          icon={Eye}
                          label="View"
                          href={`/batches/${batch.id}/manage`}
                        />
                        <BranchIconAction
                          icon={Trash2}
                          label="Delete"
                          destructive
                          onClick={() => setDeleteBatchTarget(batch)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard>
          <BranchOverviewSectionHeader
            title="Recent Students"
            onViewAll={() => onNavigateToTab("students")}
            showAction={false}
          />

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : students.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center">
              <p className="text-sm font-medium text-slate-700">
                No students yet
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={() => {
                  router.push(`/students/create?branchId=${branchId}`);
                }}
              >
                Add Student
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {students.map((student) => (
                <button
                  key={student.id}
                  type="button"
                  onClick={() =>
                    router.push(`/students/${student.id}/manage`)
                  }
                  className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/40 px-3 py-3 text-left transition-colors hover:bg-slate-50"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-violet-700">
                    {getInitials(student.firstName, student.lastName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-900">
                      {formatPersonName(
                        student.firstName,
                        student.lastName,
                      )}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {student.studentCode}
                      {student.email ? ` · ${student.email}` : ""}
                    </p>
                  </div>
                  <div className="hidden shrink-0 text-right sm:block">
                    <StudentStatusBadge
                      status={student.status}
                      isActive={student.isActive}
                      isDeleted={isArchivedStudent(student)}
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      {enrollmentCountByStudent[student.id] ?? 0} enrollments
                    </p>
                  </div>
                </button>
              ))}
              <button
                type="button"
                onClick={() => onNavigateToTab("students")}
                className="flex w-full items-center justify-center gap-1 pt-2 text-sm font-medium text-[#2447A8] hover:underline"
              >
                View all students
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </SectionCard>

        <SectionCard>
          <BranchOverviewSectionHeader
            title="Recent Enrollments"
            onViewAll={() => onNavigateToTab("enrollments")}
            showAction={false}
          />

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : enrollments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center">
              <p className="text-sm font-medium text-slate-700">
                No enrollments yet
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {enrollments.map((enrollment) => (
                <button
                  key={enrollment.id}
                  type="button"
                  onClick={() => {
                    if (enrollment.student?.id) {
                      router.push(
                        `/students/${enrollment.student.id}/manage/enrollments`,
                      );
                    }
                  }}
                  className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/40 px-3 py-3 text-left transition-colors hover:bg-slate-50"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
                    {getInitials(
                      enrollment.student?.firstName,
                      enrollment.student?.lastName,
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-900">
                      {formatPersonName(
                        enrollment.student?.firstName,
                        enrollment.student?.lastName,
                      )}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {formatBatchLabel(
                        enrollment.batch?.name,
                        enrollment.batch?.code,
                      )}
                      {enrollment.course?.title
                        ? ` · ${enrollment.course.title}`
                        : ""}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {formatStudentDate(
                        enrollment.admissionDate ?? enrollment.createdAt,
                      )}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <StudentEnrollmentActiveBadge enrollment={enrollment} />
                  </div>
                </button>
              ))}
              <button
                type="button"
                onClick={() => onNavigateToTab("enrollments")}
                className="flex w-full items-center justify-center gap-1 pt-2 text-sm font-medium text-[#2447A8] hover:underline"
              >
                View all enrollments
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </SectionCard>
      </div>

      <section className="border-t border-slate-200/80 pt-8">
        <BranchOverviewMetricCards
          summary={summary}
          isLoading={summaryLoading}
        />
      </section>

      <AssignEntitiesModal
        open={assignOpen}
        title={
          assignKind === "categories" ? "Assign Categories" : "Assign Courses"
        }
        items={assignCandidates}
        isLoading={assignLoading}
        isSubmitting={assignSubmitting}
        search={assignSearch}
        onSearchChange={setAssignSearch}
        searchPlaceholder={
          assignKind === "categories"
            ? "Search categories..."
            : "Search courses..."
        }
        emptyMessage="No records available to assign"
        onClose={() => {
          setAssignOpen(false);
          setAssignKind(null);
        }}
        onAssign={handleAssign}
      />

      <ConfirmDialog
        open={Boolean(unassignTarget)}
        title={
          unassignTarget?.kind === "categories"
            ? "Unassign Category"
            : "Unassign Course"
        }
        description={`Remove "${unassignTarget?.label ?? "this item"}" from this branch? The record itself will not be deleted.`}
        confirmLabel="Unassign"
        loading={unassignLoading}
        onCancel={() => setUnassignTarget(null)}
        onConfirm={handleUnassign}
      />

      <ConfirmDialog
        open={Boolean(deleteBatchTarget)}
        title="Archive Batch"
        description={`Archive "${deleteBatchTarget?.name ?? "this batch"}"?`}
        confirmLabel="Archive"
        loading={isDeletingBatch}
        onCancel={() => setDeleteBatchTarget(null)}
        onConfirm={handleDeleteBatch}
      />
    </div>
  );
}
