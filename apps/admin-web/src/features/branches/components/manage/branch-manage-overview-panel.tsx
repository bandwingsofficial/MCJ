"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { BookOpen, Layers, Tag, UserCheck } from "lucide-react";

import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import type { Branch } from "@/src/features/branches/types/branch.types";
import type { BranchSummaryCounts } from "@/src/features/branches/hooks/use-branch-summary";
import { BranchStatusBadge } from "@/src/features/branches/components/branch-status-badge";
import { BranchOverviewSectionHeader } from "@/src/features/branches/components/manage/branch-overview-section-header";
import { BranchManageCardGrid } from "@/src/features/branches/components/manage/branch-manage-card-grid";
import { BranchManageSection } from "@/src/features/branches/components/manage/branch-manage-section";
import { BranchBatchOverviewCard } from "@/src/features/branches/components/manage/branch-batch-overview-card";
import { BranchBatchOverviewMetrics } from "@/src/features/branches/components/manage/branch-batch-overview-metrics";
import { BranchSummaryModuleCard } from "@/src/features/branches/components/manage/branch-summary-module-card";
import { BranchStudentEnrolledCard } from "@/src/features/branches/components/manage/branch-student-enrolled-card";
import type { BranchManageTabKey } from "@/src/features/branches/components/manage/branch-manage-tab.types";
import {
  formatBranchAddress,
  formatTrainerNames,
} from "@/src/features/branches/utils/branch-display.utils";
import {
  computeBranchBatchOverviewStats,
  getBranchBatchTotalTimings,
} from "@/src/features/branches/utils/branch-batch-overview.utils";
import { categoryService } from "@/src/features/categories/services/category.service";
import type { CategoryListItem } from "@/src/features/categories/types/category.types";
import { CategoryStatusBadge } from "@/src/features/categories/components/category-status-badge";
import { courseService } from "@/src/features/courses/services/course.service";
import type { CourseListItem } from "@/src/features/courses/types/course.types";
import { batchService } from "@/src/features/batches/services/batch.service";
import type { Batch } from "@/src/features/batches/types/batch.types";
import { enrollmentService } from "@/src/features/enrollments/services/enrollment.service";
import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";
import { parseEnrollmentListResponse } from "@/src/features/enrollments/utils/enrollment-list.utils";
import { trainerService } from "@/src/features/trainers/services/trainer.service";

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

interface OverviewCourse extends CourseListItem {
  trainerLabel: string;
}

const PREVIEW_LIMIT = 4;
const BATCH_PREVIEW_LIMIT = 4;
const BRANCH_BATCH_FETCH_LIMIT = 100;
const BRANCH_ENROLLMENT_FETCH_LIMIT = 500;

function OverviewField({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-[#E8F0FA] bg-[#F8FBFF]/60 px-3 py-2">
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-medium text-[#102A56]">{value}</dd>
    </div>
  );
}

async function loadCourseTrainers(
  courses: CourseListItem[],
): Promise<OverviewCourse[]> {
  return Promise.all(
    courses.map(async (course) => {
      try {
        const trainers = await trainerService.getTrainersForCourse(course.id);
        return {
          ...course,
          trainerLabel: formatTrainerNames(trainers),
        };
      } catch {
        return {
          ...course,
          trainerLabel: "",
        };
      }
    }),
  );
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
  const [courses, setCourses] = useState<OverviewCourse[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [branchEnrollments, setBranchEnrollments] = useState<Enrollment[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courseCountByCategory, setCourseCountByCategory] = useState<
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
        branchEnrollmentResponse,
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
          pageSize: BRANCH_BATCH_FETCH_LIMIT,
        }),
        enrollmentService.getEnrollments({
          branchId,
          skip: 0,
          take: BRANCH_ENROLLMENT_FETCH_LIMIT,
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
      const courseItems = (courseResponse.data.items ?? []).filter(
        (item) => !item.isDeleted,
      );
      const batchItems = batchResponse.data.items ?? [];
      const branchEnrollmentItems = parseEnrollmentListResponse(
        branchEnrollmentResponse,
      ).items;
      const enrollmentItems = parseEnrollmentListResponse(enrollmentResponse)
        .items;

      setCategories(categoryItems);
      setCourses(await loadCourseTrainers(courseItems));
      setBatches(batchItems);
      setBranchEnrollments(branchEnrollmentItems);
      setEnrollments(enrollmentItems);

      const categoryCounts: Record<string, number> = {};
      for (const course of allCoursesResponse.data.items ?? []) {
        if (course.categoryId) {
          categoryCounts[course.categoryId] =
            (categoryCounts[course.categoryId] ?? 0) + 1;
        }
      }
      setCourseCountByCategory(categoryCounts);
    } catch (error) {
      appToast.error(getErrorMessage(error));
      setCategories([]);
      setCourses([]);
      setBatches([]);
      setBranchEnrollments([]);
      setEnrollments([]);
      setCourseCountByCategory({});
    } finally {
      setPreviewLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    void loadPreview();
  }, [loadPreview]);

  const batchStats = computeBranchBatchOverviewStats(
    batches,
    branchEnrollments,
  );
  const batchCount = batchStats.totalBatches;
  const totalTimings = getBranchBatchTotalTimings(batches);
  const previewBatches = batches.slice(0, BATCH_PREVIEW_LIMIT);
  const categoryCount = summary?.categories ?? categories.length;
  const courseCount = summary?.courses ?? courses.length;
  const enrolledCount = summary?.enrollments ?? enrollments.length;

  return (
    <div className="space-y-3">
      <BranchManageSection
        title="Branch Information"
        description="Core branch profile and contact details."
      >
        <dl className="grid gap-3 sm:grid-cols-2">
          <OverviewField label="Branch Name" value={branch.branchName} />
          <OverviewField label="Branch Code" value={branch.branchCode} />
          <OverviewField label="Email" value={branch.email ?? "—"} />
          <OverviewField label="Phone" value={branch.phone ?? "—"} />
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
      </BranchManageSection>

      <BranchManageSection
        title="Branch Batches"
        description="Parent batches and timings assigned to this branch."
      >
        <BranchOverviewSectionHeader
          actionsOnly
          onViewAll={() => onNavigateToTab("batches")}
          actionLabel="Assign Batch"
          onAction={() => onNavigateToTab("batches", { assign: true })}
          actionDisabled={assignmentsDisabled}
        />

        <BranchBatchOverviewMetrics
          stats={batchStats}
          isLoading={previewLoading}
        />

        <div className="mt-3 border-t border-slate-100 pt-3">
          <p className="text-sm text-[#647A9B]">
            {previewLoading
              ? "Loading batch summary…"
              : `${batchCount} parent batch${batchCount === 1 ? "" : "es"} · ${totalTimings} batch timing${totalTimings === 1 ? "" : "s"} · ${batchStats.totalStudents} student${batchStats.totalStudents === 1 ? "" : "s"}`}
          </p>
        </div>

        <div className="mt-3">
          <BranchManageCardGrid
            isLoading={previewLoading}
            isEmpty={!previewLoading && previewBatches.length === 0}
            emptyMessage="No Batches Yet"
            emptyDescription="Assign batches to this branch to manage schedules and enrollments."
            emptyIcon={Layers}
            columnsClassName="grid grid-cols-1 gap-3 xl:grid-cols-2"
            skeletonCount={2}
          >
            {previewBatches.map((batch) => (
              <BranchBatchOverviewCard key={batch.id} batch={batch} />
            ))}
          </BranchManageCardGrid>
        </div>
      </BranchManageSection>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <BranchManageSection
          title={`Categories (${summaryLoading ? "…" : categoryCount})`}
          description="Categories assigned to this branch."
        >
          <BranchOverviewSectionHeader
            actionsOnly
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
            emptyIcon={Tag}
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
        </BranchManageSection>

        <BranchManageSection
          title={`Courses (${summaryLoading ? "…" : courseCount})`}
          description="Courses available at this branch."
        >
          <BranchOverviewSectionHeader
            actionsOnly
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
            emptyIcon={BookOpen}
            columnsClassName="grid grid-cols-1 gap-3"
            skeletonCount={2}
          >
            {courses.map((course) => (
              <BranchSummaryModuleCard
                key={course.id}
                title={course.title}
                subtitle={course.trainerLabel || undefined}
                imageUrl={course.thumbnailUrl}
                imageAlt={course.title}
              />
            ))}
          </BranchManageCardGrid>
        </BranchManageSection>
      </div>

      <BranchManageSection
        title={`Students Enrolled (${summaryLoading ? "…" : enrolledCount})`}
        description="Current enrollments linked to this branch."
      >
        <BranchOverviewSectionHeader
          actionsOnly
          onViewAll={() => onNavigateToTab("students")}
          showAction={false}
        />

        <BranchManageCardGrid
          isLoading={previewLoading}
          isEmpty={!previewLoading && enrollments.length === 0}
          emptyMessage="No Students Enrolled Yet"
          emptyDescription="Students enrolled in this branch through the Enrollment module will appear here."
          emptyIcon={UserCheck}
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
      </BranchManageSection>
    </div>
  );
}
