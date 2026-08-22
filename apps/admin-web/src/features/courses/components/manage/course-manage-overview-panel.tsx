"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Eye,
  Pencil,
  Plus,
  Power,
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
import { formatContentOrderNumber } from "@/src/shared/utils/content-order";

import { BranchIconAction } from "@/src/features/branches/components/manage/branch-icon-action";
import { BranchOverviewSectionHeader } from "@/src/features/branches/components/manage/branch-overview-section-header";
import {
  formatBatchLabel,
  formatPersonName,
  formatTrainerNames,
  truncateText,
} from "@/src/features/branches/utils/branch-display.utils";
import { useActivateBatch } from "@/src/features/batches/hooks/useActivateBatch";
import { useDeactivateBatch } from "@/src/features/batches/hooks/useDeactivateBatch";
import { useDeleteBatch } from "@/src/features/batches/hooks/useDeleteBatch";
import { BatchStatusBadge } from "@/src/features/batches/components/BatchStatusBadge";
import { batchService } from "@/src/features/batches/services/batch.service";
import type { Batch } from "@/src/features/batches/types/batch.types";
import { isArchivedBatch } from "@/src/features/batches/utils/batch-bulk.utils";
import { CourseModuleStatusBadge } from "@/src/features/course-modules/components";
import { useCourseModules } from "@/src/features/course-modules/hooks";
import type { CourseModule } from "@/src/features/course-modules/types/course-module.types";
import { CourseOverviewInformation } from "@/src/features/courses/components/manage/course-overview-information";
import { CourseOverviewMetricCards } from "@/src/features/courses/components/manage/course-overview-metric-cards";
import type {
  CourseDetails,
  CourseSummary,
} from "@/src/features/courses/types/course.types";
import { getModuleContentCounts } from "@/src/features/courses/utils/course-content-stats.util";
import { courseManageModulePath } from "@/src/features/courses/utils/course-manage.routes";
import { getCoursePricing } from "@/src/features/courses/utils/course-pricing.util";
import { enrollmentService } from "@/src/features/enrollments/services/enrollment.service";
import { SortOrder } from "@/src/features/enrollments/types/enrollment.enums";
import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";
import { formatCurrency } from "@/src/features/enrollments/utils/format-payment";
import { parseEnrollmentListResponse } from "@/src/features/enrollments/utils/enrollment-list.utils";
import { StudentEnrollmentActiveBadge } from "@/src/features/students/components/manage/student-enrollment-active-badge";
import { formatStudentDate } from "@/src/features/students/utils/student-form.utils";
import { studentManageTabPath } from "@/src/features/students/utils/student-manage.routes";

import type { TabKey } from "./course-manage-workspace";

const OVERVIEW_MODULE_LIMIT = 6;
const OVERVIEW_BATCH_LIMIT = 5;
const OVERVIEW_ENROLLMENT_LIMIT = 5;

interface Props {
  course: CourseDetails;
  summary: CourseSummary | null;
  summaryLoading?: boolean;
  refreshKey?: number;
  onSummaryRefresh?: () => Promise<void>;
  onNavigateToTab: (tab: TabKey) => void;
  onEditCourse?: () => void;
}

function getInitials(firstName?: string | null, lastName?: string | null): string {
  const first = firstName?.trim().charAt(0) ?? "";
  const last = lastName?.trim().charAt(0) ?? "";
  const initials = `${first}${last}`.toUpperCase();

  return initials || "?";
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

function ModuleCardSkeleton() {
  return <Skeleton className="h-40 w-full rounded-xl" />;
}

export function CourseManageOverviewPanel({
  course,
  summary,
  summaryLoading = false,
  refreshKey = 0,
  onSummaryRefresh,
  onNavigateToTab,
  onEditCourse,
}: Props) {
  const router = useRouter();
  const courseId = course.id;
  const pricing = useMemo(() => getCoursePricing(course), [course]);
  const pricingLabel = course.isFree
    ? "Free"
    : formatCurrency(pricing.finalAmount);

  const { modules, isLoading: modulesLoading } = useCourseModules({
    courseId,
    includeDeleted: false,
  });

  const moduleTreeById = useMemo(
    () => new Map((course.modules ?? []).map((module) => [module.id, module])),
    [course.modules],
  );

  const [isLoading, setIsLoading] = useState(true);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [enrollmentTotal, setEnrollmentTotal] = useState(0);

  const [deleteBatchTarget, setDeleteBatchTarget] = useState<Batch | null>(null);
  const [batchStatusTarget, setBatchStatusTarget] = useState<{
    batch: Batch;
    action: "activate" | "deactivate";
  } | null>(null);

  const { deleteBatch, isLoading: isDeletingBatch } = useDeleteBatch();
  const { activateBatch, isLoading: isActivatingBatch } = useActivateBatch();
  const { deactivateBatch, isLoading: isDeactivatingBatch } =
    useDeactivateBatch();

  const loadOverviewData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [batchResponse, enrollmentResponse] = await Promise.all([
        batchService.getBatches({
          courseId,
          includeDeleted: false,
          page: 1,
          pageSize: 200,
        }),
        enrollmentService.getEnrollments({
          courseId,
          includeDeleted: false,
          skip: 0,
          take: OVERVIEW_ENROLLMENT_LIMIT,
          sortBy: "createdAt",
          sortOrder: SortOrder.DESC,
        }),
      ]);

      setBatches(batchResponse.data.items ?? []);

      const parsedEnrollments = parseEnrollmentListResponse(enrollmentResponse);
      setEnrollments(parsedEnrollments.items);
      setEnrollmentTotal(parsedEnrollments.total);
    } catch (error) {
      appToast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    void loadOverviewData();
  }, [loadOverviewData, refreshKey]);

  const visibleModules = useMemo(
    () => modules.slice(0, OVERVIEW_MODULE_LIMIT),
    [modules],
  );

  const visibleBatches = useMemo(
    () => batches.slice(0, OVERVIEW_BATCH_LIMIT),
    [batches],
  );

  const handleDeleteBatch = async () => {
    if (!deleteBatchTarget) {
      return;
    }

    try {
      await deleteBatch(deleteBatchTarget.id);
      appToast.success("Batch archived successfully");
      setDeleteBatchTarget(null);
      await loadOverviewData();
      await onSummaryRefresh?.();
    } catch (error) {
      appToast.error(getErrorMessage(error));
    }
  };

  const handleBatchStatusChange = async () => {
    if (!batchStatusTarget) {
      return;
    }

    try {
      if (batchStatusTarget.action === "activate") {
        await activateBatch(batchStatusTarget.batch.id);
        appToast.success("Batch activated successfully");
      } else {
        await deactivateBatch(batchStatusTarget.batch.id);
        appToast.success("Batch deactivated successfully");
      }

      setBatchStatusTarget(null);
      await loadOverviewData();
      await onSummaryRefresh?.();
    } catch (error) {
      appToast.error(getErrorMessage(error));
    }
  };

  const getModuleCounts = (module: CourseModule) => {
    const tree = moduleTreeById.get(module.id);
    if (tree) {
      return getModuleContentCounts(tree);
    }

    return { lessons: 0, resources: 0, quizzes: 0, assignments: 0 };
  };

  const formatModuleDuration = (duration: number | null) => {
    if (!duration) {
      return null;
    }

    return `${duration} min`;
  };

  return (
    <div className="space-y-6">
      <CourseOverviewInformation
        course={course}
        onEditCourse={onEditCourse}
      />

      <SectionCard>
        <BranchOverviewSectionHeader
          title="Modules"
          onViewAll={() => onNavigateToTab("modules")}
          actionLabel="Manage Modules"
          onAction={() => onNavigateToTab("modules")}
        />

        {modulesLoading ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <ModuleCardSkeleton key={index} />
            ))}
          </div>
        ) : visibleModules.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-10 text-center">
            <p className="text-sm font-medium text-slate-700">No modules yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Create your first module to start building course content.
            </p>
            <Button
              type="button"
              size="sm"
              className="mt-4"
              onClick={() => onNavigateToTab("modules")}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Manage Modules
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {visibleModules.map((module, index) => {
              const counts = getModuleCounts(module);
              const durationLabel = formatModuleDuration(module.duration);

              return (
                <div
                  key={module.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/40 p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-sm font-semibold text-violet-700">
                      {formatContentOrderNumber(index + 1)}
                    </div>
                    <BranchIconAction
                      icon={Eye}
                      label="Manage module"
                      href={courseManageModulePath(courseId, module.id)}
                    />
                  </div>
                  <p className="mt-3 font-semibold text-slate-900">
                    {module.title}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {truncateText(module.description, 72)}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    {counts.lessons} lesson{counts.lessons === 1 ? "" : "s"}
                    {durationLabel ? ` · ${durationLabel}` : ""}
                  </p>
                  <div className="mt-3">
                    <CourseModuleStatusBadge module={module} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      <SectionCard>
        <BranchOverviewSectionHeader
          title="Batches"
          onViewAll={() => router.push("/batches")}
          actionLabel="Create Batch"
          onAction={() => router.push("/batches/create")}
        />

        {isLoading ? (
          <Skeleton className="h-48 w-full rounded-xl" />
        ) : visibleBatches.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-10 text-center">
            <p className="text-sm font-medium text-slate-700">No batches yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Create a batch for this course.
            </p>
            <Button
              type="button"
              size="sm"
              className="mt-4"
              onClick={() => router.push("/batches/create")}
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
                  <TableHead>Branch</TableHead>
                  <TableHead>Trainer(s)</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Enrolled</TableHead>
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
                    <TableCell>
                      {batch.branch?.branchName ?? "—"}
                    </TableCell>
                    <TableCell className="max-w-[180px] truncate">
                      {formatTrainerNames(batch.trainers ?? [])}
                    </TableCell>
                    <TableCell>{formatStudentDate(batch.startDate)}</TableCell>
                    <TableCell>{formatStudentDate(batch.endDate)}</TableCell>
                    <TableCell>{batch.capacity ?? "—"}</TableCell>
                    <TableCell>{batch.enrolledCount ?? 0}</TableCell>
                    <TableCell>
                      <BatchStatusBadge status={batch.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <BranchIconAction
                          icon={Eye}
                          label="View batch"
                          href={`/batches/${batch.id}/manage`}
                        />
                        <BranchIconAction
                          icon={Pencil}
                          label="Edit batch"
                          href={`/batches/${batch.id}/edit`}
                        />
                        {!isArchivedBatch(batch) ? (
                          batch.isActive === false ? (
                            <BranchIconAction
                              icon={Power}
                              label="Activate batch"
                              onClick={() =>
                                setBatchStatusTarget({
                                  batch,
                                  action: "activate",
                                })
                              }
                            />
                          ) : (
                            <BranchIconAction
                              icon={Power}
                              label="Deactivate batch"
                              onClick={() =>
                                setBatchStatusTarget({
                                  batch,
                                  action: "deactivate",
                                })
                              }
                            />
                          )
                        ) : null}
                        <BranchIconAction
                          icon={Trash2}
                          label="Delete batch"
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

      <SectionCard>
        <BranchOverviewSectionHeader
          title="Recent Enrollments"
          onViewAll={() => router.push("/students")}
          showAction={false}
        />

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : enrollments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-10 text-center">
            <p className="text-sm font-medium text-slate-700">
              No enrollments yet
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Students enrolled in this course will appear here.
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
                      studentManageTabPath(
                        enrollment.student.id,
                        "enrollments",
                      ),
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
                    {enrollment.student?.studentCode ?? "—"}
                    {" · "}
                    {formatBatchLabel(
                      enrollment.batch?.name,
                      enrollment.batch?.code,
                    )}
                    {enrollment.branch?.branchName
                      ? ` · ${enrollment.branch.branchName}`
                      : ""}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {formatStudentDate(
                      enrollment.admissionDate ?? enrollment.createdAt,
                    )}
                    {" · "}
                    {formatCurrency(enrollment.finalAmount)}
                  </p>
                </div>
                <div className="shrink-0">
                  <StudentEnrollmentActiveBadge enrollment={enrollment} />
                </div>
              </button>
            ))}
            <button
              type="button"
              onClick={() => router.push("/students")}
              className="flex w-full items-center justify-center gap-1 pt-2 text-sm font-medium text-[#2447A8] hover:underline"
            >
              View all enrollments
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </SectionCard>

      <section className="border-t border-slate-200/80 pt-8">
        <h2 className="mb-4 text-base font-semibold text-slate-900">Summary</h2>
        <CourseOverviewMetricCards
          summary={summary}
          enrollmentCount={enrollmentTotal}
          pricingLabel={pricingLabel}
          isLoading={summaryLoading || isLoading}
        />
      </section>

      <ConfirmDialog
        open={Boolean(deleteBatchTarget)}
        title="Archive Batch"
        description={`Archive "${deleteBatchTarget?.name ?? "this batch"}"?`}
        confirmLabel="Archive"
        loading={isDeletingBatch}
        onCancel={() => setDeleteBatchTarget(null)}
        onConfirm={handleDeleteBatch}
      />

      <ConfirmDialog
        open={Boolean(batchStatusTarget)}
        title={
          batchStatusTarget?.action === "activate"
            ? "Activate Batch"
            : "Deactivate Batch"
        }
        description={`${
          batchStatusTarget?.action === "activate" ? "Activate" : "Deactivate"
        } "${batchStatusTarget?.batch.name ?? "this batch"}"?`}
        confirmLabel={
          batchStatusTarget?.action === "activate" ? "Activate" : "Deactivate"
        }
        loading={isActivatingBatch || isDeactivatingBatch}
        onCancel={() => setBatchStatusTarget(null)}
        onConfirm={handleBatchStatusChange}
      />
    </div>
  );
}
