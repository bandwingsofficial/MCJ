"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";

import { Card } from "@/src/shared/components/ui/card";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import type { Branch } from "@/src/features/branches/types/branch.types";
import type { BranchSummaryCounts } from "@/src/features/branches/hooks/use-branch-summary";
import { BranchStatusBadge } from "@/src/features/branches/components/branch-status-badge";
import { BranchOverviewMetricCards } from "@/src/features/branches/components/manage/branch-overview-metric-cards";
import { BranchOverviewSectionHeader } from "@/src/features/branches/components/manage/branch-overview-section-header";
import { BranchManageCardGrid } from "@/src/features/branches/components/manage/branch-manage-card-grid";
import { BranchSummaryModuleCard } from "@/src/features/branches/components/manage/branch-summary-module-card";
import { BranchBatchCard } from "@/src/features/branches/components/manage/branch-batch-card";
import { BranchStudentEnrolledCard } from "@/src/features/branches/components/manage/branch-student-enrolled-card";
import type { BranchManageTabKey } from "@/src/features/branches/components/manage/branch-manage-tab.types";
import { formatBranchAddress } from "@/src/features/branches/utils/branch-display.utils";
import { categoryService } from "@/src/features/categories/services/category.service";
import type { CategoryListItem } from "@/src/features/categories/types/category.types";
import { CategoryStatusBadge } from "@/src/features/categories/components/category-status-badge";
import { courseService } from "@/src/features/courses/services/course.service";
import type { CourseListItem } from "@/src/features/courses/types/course.types";
import { CourseStatusBadge } from "@/src/features/courses/components/course-status-badge";
import {
  formatCourseDuration,
  formatCourseLevel,
  formatCoursePrice,
} from "@/src/features/branches/utils/branch-display.utils";
import { batchService } from "@/src/features/batches/services/batch.service";
import type { Batch } from "@/src/features/batches/types/batch.types";
import { enrollmentService } from "@/src/features/enrollments/services/enrollment.service";
import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";
import { parseEnrollmentListResponse } from "@/src/features/enrollments/utils/enrollment-list.utils";

interface Props {
  branch: Branch;
  summary: BranchSummaryCounts | null;
  summaryLoading?: boolean;
  assignmentsDisabled?: boolean;
  onNavigateToTab: (
    tab: BranchManageTabKey,
    options?: { assign?: boolean },
  ) => void;
}

const PREVIEW_LIMIT = 4;
const BATCH_PREVIEW_LIMIT = 4;

function OverviewField({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="text-sm font-medium text-slate-900">{value}</dd>
    </div>
  );
}

async function loadCourseTitlesByBatch(
  batches: Batch[],
): Promise<Record<string, string[]>> {
  const entries = await Promise.all(
    batches.map(async (batch) => {
      try {
        const assignments = await batchService.getBatchCourses(batch.id);
        const titles = assignments
          .map((item) => item.course?.title?.trim())
          .filter((title): title is string => Boolean(title));

        if (titles.length > 0) {
          return [batch.id, titles] as const;
        }

        if (batch.course?.title) {
          return [batch.id, [batch.course.title]] as const;
        }

        return [batch.id, []] as const;
      } catch {
        return [
          batch.id,
          batch.course?.title ? [batch.course.title] : [],
        ] as const;
      }
    }),
  );

  return Object.fromEntries(entries);
}

export function BranchManageOverviewPanel({
  branch,
  summary,
  summaryLoading = false,
  assignmentsDisabled = false,
  onNavigateToTab,
}: Props) {
  const branchId = branch.id;
  const address = formatBranchAddress(branch);

  const [previewLoading, setPreviewLoading] = useState(true);
  const [categories, setCategories] = useState<CategoryListItem[]>([]);
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [courseTitlesByBatchId, setCourseTitlesByBatchId] = useState<
    Record<string, string[]>
  >({});
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courseCountByCategory, setCourseCountByCategory] = useState<
    Record<string, number>
  >({});
  const [batchCountByCourse, setBatchCountByCourse] = useState<
    Record<string, number>
  >({});

  const loadPreview = useCallback(async () => {
    setPreviewLoading(true);
    try {
      const [
        categoryResponse,
        courseResponse,
        allCoursesResponse,
        batchResponse,
        allBatchesResponse,
        enrollmentResponse,
      ] = await Promise.all([
        categoryService.getCategories({
          search: "",
          status: "ACTIVE",
          branchId,
          page: 1,
          pageSize: PREVIEW_LIMIT,
        }),
        courseService.getCourses({
          branchId,
          page: 1,
          pageSize: PREVIEW_LIMIT,
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
          pageSize: BATCH_PREVIEW_LIMIT,
        }),
        batchService.getBatches({
          branchId,
          includeDeleted: false,
          page: 1,
          pageSize: 100,
        }),
        enrollmentService.getEnrollments({
          branchId,
          skip: 0,
          take: PREVIEW_LIMIT,
        }),
      ]);

      const categoryItems = (categoryResponse.data ?? []).filter(
        (item) => !item.isDeleted && item.status === "ACTIVE",
      );
      const courseItems = courseResponse.data.items ?? [];
      const batchItems = batchResponse.data.items ?? [];
      const enrollmentItems = parseEnrollmentListResponse(enrollmentResponse)
        .items;

      setCategories(categoryItems);
      setCourses(courseItems);
      setBatches(batchItems);
      setEnrollments(enrollmentItems);
      setCourseTitlesByBatchId(await loadCourseTitlesByBatch(batchItems));

      const categoryCounts: Record<string, number> = {};
      const batchCounts: Record<string, number> = {};
      for (const course of allCoursesResponse.data.items ?? []) {
        if (course.categoryId) {
          categoryCounts[course.categoryId] =
            (categoryCounts[course.categoryId] ?? 0) + 1;
        }
      }
      for (const batch of allBatchesResponse.data.items ?? []) {
        if (batch.courseId) {
          batchCounts[batch.courseId] = (batchCounts[batch.courseId] ?? 0) + 1;
        }
      }
      setCourseCountByCategory(categoryCounts);
      setBatchCountByCourse(batchCounts);
    } catch (error) {
      appToast.error(getErrorMessage(error));
      setCategories([]);
      setCourses([]);
      setBatches([]);
      setEnrollments([]);
      setCourseTitlesByBatchId({});
      setCourseCountByCategory({});
      setBatchCountByCourse({});
    } finally {
      setPreviewLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    void loadPreview();
  }, [loadPreview]);

  const batchCount = summary?.batches ?? batches.length;
  const categoryCount = summary?.categories ?? categories.length;
  const courseCount = summary?.courses ?? courses.length;
  const enrolledCount = summary?.enrollments ?? enrollments.length;

  return (
    <div className="space-y-4">
      <Card className="rounded-xl border border-slate-200/80 p-4 shadow-sm">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Branch Information
        </h2>

        <dl className="mt-3 grid gap-3 sm:grid-cols-2">
          <OverviewField label="Branch Name" value={branch.branchName} />
          <OverviewField label="Branch Code" value={branch.branchCode} />
          <OverviewField label="Email" value={branch.email ?? ""} />
          <OverviewField label="Phone" value={branch.phone ?? ""} />
          {address ? (
            <div className="sm:col-span-2">
              <OverviewField label="Address" value={address} />
            </div>
          ) : null}
          <OverviewField
            label="Status"
            value={
              <BranchStatusBadge
                status={branch.status}
                deletedAt={branch.deletedAt}
              />
            }
          />
          {branch.description?.trim() ? (
            <div className="sm:col-span-2">
              <OverviewField
                label="Description"
                value={branch.description.trim()}
              />
            </div>
          ) : null}
        </dl>
      </Card>

      <BranchOverviewMetricCards summary={summary} isLoading={summaryLoading} />

      <Card className="rounded-xl border border-slate-200/80 p-5 shadow-sm">
        <BranchOverviewSectionHeader
          title={`Batches (${summaryLoading ? "…" : batchCount})`}
          onViewAll={() => onNavigateToTab("batches")}
          actionLabel="Assign Batch"
          onAction={() => onNavigateToTab("batches", { assign: true })}
          actionDisabled={assignmentsDisabled}
        />

        <BranchManageCardGrid
          isLoading={previewLoading}
          isEmpty={!previewLoading && batches.length === 0}
          emptyMessage="No Batches Yet"
          emptyDescription="Assign batches to this branch to manage schedules and enrollments."
          columnsClassName="grid grid-cols-1 gap-4 xl:grid-cols-2"
          skeletonCount={2}
        >
          {batches.map((batch) => (
            <BranchBatchCard
              key={batch.id}
              batch={batch}
              courseTitles={courseTitlesByBatchId[batch.id]}
              compact
            />
          ))}
        </BranchManageCardGrid>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className="rounded-xl border border-slate-200/80 p-4 shadow-sm">
          <BranchOverviewSectionHeader
            title={`Categories (${summaryLoading ? "…" : categoryCount})`}
            onViewAll={() => onNavigateToTab("categories")}
            actionLabel="Assign Category"
            onAction={() => onNavigateToTab("categories", { assign: true })}
            actionDisabled={assignmentsDisabled}
          />

          <BranchManageCardGrid
            isLoading={previewLoading}
            isEmpty={!previewLoading && categories.length === 0}
            emptyMessage="No Categories Yet"
            emptyDescription="Assign categories to organize branch courses."
            columnsClassName="grid grid-cols-1 gap-3"
            skeletonCount={2}
          >
            {categories.map((item) => (
              <BranchSummaryModuleCard
                key={item.id}
                title={item.name}
                subtitle={item.description?.trim() || undefined}
                imageUrl={item.thumbnailUrl}
                imageAlt={item.name}
                assignedCount={courseCountByCategory[item.id] ?? 0}
                assignedLabel={
                  (courseCountByCategory[item.id] ?? 0) === 1
                    ? "course"
                    : "courses"
                }
                badge={<CategoryStatusBadge status={item.status} />}
              />
            ))}
          </BranchManageCardGrid>
        </Card>

        <Card className="rounded-xl border border-slate-200/80 p-4 shadow-sm">
          <BranchOverviewSectionHeader
            title={`Courses (${summaryLoading ? "…" : courseCount})`}
            onViewAll={() => onNavigateToTab("courses")}
            actionLabel="Assign Course"
            onAction={() => onNavigateToTab("courses", { assign: true })}
            actionDisabled={assignmentsDisabled}
          />

          <BranchManageCardGrid
            isLoading={previewLoading}
            isEmpty={!previewLoading && courses.length === 0}
            emptyMessage="No Courses Yet"
            emptyDescription="Assign courses available at this branch."
            columnsClassName="grid grid-cols-1 gap-3"
            skeletonCount={2}
          >
            {courses.map((course) => (
              <BranchSummaryModuleCard
                key={course.id}
                title={course.title}
                subtitle={course.code ?? undefined}
                assignedCount={batchCountByCourse[course.id] ?? 0}
                assignedLabel={
                  (batchCountByCourse[course.id] ?? 0) === 1
                    ? "batch"
                    : "batches"
                }
                badge={<CourseStatusBadge status={course.status} />}
                meta={
                  <>
                    <p>
                      {formatCourseLevel(course.level)} ·{" "}
                      {formatCourseDuration(
                        course.duration,
                        course.durationType,
                      )}
                    </p>
                    <p>{formatCoursePrice(course)}</p>
                  </>
                }
              />
            ))}
          </BranchManageCardGrid>
        </Card>
      </div>

      <Card className="rounded-xl border border-slate-200/80 p-4 shadow-sm">
        <BranchOverviewSectionHeader
          title={`Students Enrolled (${summaryLoading ? "…" : enrolledCount})`}
          onViewAll={() => onNavigateToTab("students")}
        />

        <BranchManageCardGrid
          isLoading={previewLoading}
          isEmpty={!previewLoading && enrollments.length === 0}
          emptyMessage="No Students Enrolled Yet"
          emptyDescription="Students enrolled in this branch through the Enrollment module will appear here."
          columnsClassName="grid grid-cols-1 gap-3 lg:grid-cols-2"
          skeletonCount={2}
        >
          {enrollments.map((enrollment) => (
            <BranchStudentEnrolledCard
              key={enrollment.id}
              enrollment={enrollment}
            />
          ))}
        </BranchManageCardGrid>
      </Card>
    </div>
  );
}
