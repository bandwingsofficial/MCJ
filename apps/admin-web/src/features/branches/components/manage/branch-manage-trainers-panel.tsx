"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ChevronDown, GraduationCap, Plus } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { Dropdown } from "@/src/shared/components/ui/dropdown";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { CategoryPagination } from "@/src/features/categories/components/category-pagination";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";
import { cn } from "@/src/shared/lib/cn";

import {
  TABLE_CELL_CLASS,
  BranchManageTableShell,
} from "@/src/features/branches/components/manage/branch-manage-table-shell";
import { BranchSectionToolbar } from "@/src/features/branches/components/manage/branch-section-toolbar";
import {
  BRANCH_PAGINATION_FOOTER_CLASS,
  BRANCH_TAB_COUNT_CLASS,
  BRANCH_TAB_HEADER_CLASS,
  BRANCH_TAB_HEADER_ROW_CLASS,
  BRANCH_TAB_TITLE_CLASS,
  BRANCH_TABLE_CARD_CLASS,
} from "@/src/features/branches/components/manage/branch-manage-layout.constants";
import {
  formatTrainerDisplayName,
  getBranchCoursesForAssignment,
  getCourseAssignedTrainerIdsForBranch,
  isTrainerAssignedViaBranchCourses,
} from "@/src/features/branches/utils/branch-trainer-relation.utils";
import { DEFAULT_TRAINER_PAGE_SIZE } from "@/src/features/trainers/constants/trainer.constants";
import { TrainerStatusBadge } from "@/src/features/trainers/components/trainer-status-badge";
import { trainerService } from "@/src/features/trainers/services/trainer.service";
import type { CourseListItem } from "@/src/features/courses/types/course.types";
import type { TrainerListItem } from "@/src/features/trainers/types/trainer.types";

const ALREADY_ASSIGNED_LABEL = "ALREADY ASSIGNED";

interface AssignTarget {
  trainer: TrainerListItem;
  courseId: string;
  courseTitle: string;
}

interface Props {
  branchId: string;
  assignmentsDisabled?: boolean;
  onSummaryRefresh?: () => Promise<void>;
}

export function BranchManageTrainersPanel({
  branchId,
  assignmentsDisabled = false,
  onSummaryRefresh,
}: Props) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [trainers, setTrainers] = useState<TrainerListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [branchCourses, setBranchCourses] = useState<CourseListItem[]>([]);
  const [courseAssignedTrainerIds, setCourseAssignedTrainerIds] = useState<
    Set<string>
  >(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [assignTarget, setAssignTarget] = useState<AssignTarget | null>(null);
  const [assignLoading, setAssignLoading] = useState(false);

  const pageSize = DEFAULT_TRAINER_PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const loadData = useCallback(async () => {
    if (!branchId) {
      setTrainers([]);
      setTotal(0);
      setBranchCourses([]);
      setCourseAssignedTrainerIds(new Set());
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [trainerResponse, courses] = await Promise.all([
        trainerService.getTrainers({
          search,
          status: "ACTIVE",
          isDeleted: false,
          includeDeleted: false,
          page,
          pageSize,
        }),
        getBranchCoursesForAssignment(branchId),
      ]);

      const courseTrainerIds = await getCourseAssignedTrainerIdsForBranch(
        branchId,
        courses,
      );

      setTrainers(trainerResponse.data.items ?? []);
      setTotal(
        trainerResponse.data.meta?.total ??
          trainerResponse.data.count ??
          trainerResponse.data.items?.length ??
          0,
      );
      setBranchCourses(courses);
      setCourseAssignedTrainerIds(courseTrainerIds);
    } catch (loadError) {
      const message = getErrorMessage(loadError);
      setError(message);
      setTrainers([]);
      setTotal(0);
      setBranchCourses([]);
      setCourseAssignedTrainerIds(new Set());
      appToast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [branchId, page, pageSize, search]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const rows = useMemo(
    () =>
      trainers.map((trainer) => ({
        trainer,
        isAssigned: isTrainerAssignedViaBranchCourses(
          trainer.id,
          courseAssignedTrainerIds,
        ),
      })),
    [courseAssignedTrainerIds, trainers],
  );

  const handleAssign = async () => {
    if (!assignTarget) {
      return;
    }

    setAssignLoading(true);
    try {
      await trainerService.assignTrainersToCourse(assignTarget.courseId, [
        assignTarget.trainer.id,
      ]);
      appToast.success("Trainer assigned successfully");
      setAssignTarget(null);
      await loadData();
      await onSummaryRefresh?.();
    } catch (assignError) {
      appToast.error(getErrorMessage(assignError));
    } finally {
      setAssignLoading(false);
    }
  };

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const canAssignTrainers =
    !assignmentsDisabled && !assignLoading && branchCourses.length > 0;

  if (error && trainers.length === 0 && !isLoading) {
    return (
      <ErrorState
        title="Failed to load trainers"
        description={error}
        onRetry={() => {
          void loadData();
        }}
      />
    );
  }

  return (
    <>
      <div className="space-y-3">
        <header className={BRANCH_TAB_HEADER_CLASS}>
          <div className={BRANCH_TAB_HEADER_ROW_CLASS}>
            <div className="flex shrink-0 flex-wrap items-baseline gap-x-3 gap-y-0.5">
              <h2 className={BRANCH_TAB_TITLE_CLASS}>Trainers</h2>
              <span className={BRANCH_TAB_COUNT_CLASS}>
                Active Trainers:
                <span className="ml-1 font-semibold tabular-nums text-[#647A9B]">
                  {isLoading ? "—" : total}
                </span>
              </span>
            </div>

            <BranchSectionToolbar
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder="Search trainers..."
            />
          </div>
        </header>

        <div className={BRANCH_TABLE_CARD_CLASS}>
          <BranchManageTableShell
            embedded
            columns={[
              { key: "profile", label: "Profile", className: "w-[4.5rem]" },
              { key: "name", label: "Trainer Name" },
              { key: "qualification", label: "Qualification" },
              { key: "specialization", label: "Specialization" },
              { key: "status", label: "Status", className: "w-[8rem]" },
              {
                key: "actions",
                label: "Actions",
                className: "w-[11.5rem] text-right",
              },
            ]}
            isLoading={isLoading}
            isEmpty={!isLoading && total === 0}
            emptyTitle="No Trainers Found"
            emptyDescription={
              search.trim()
                ? "No active trainers match your search."
                : "No active trainers are available."
            }
            emptyIcon={GraduationCap}
          >
            {rows.map(({ trainer, isAssigned }) => {
              const displayName =
                formatTrainerDisplayName(trainer) || "Unnamed trainer";

              return (
                <tr
                  key={trainer.id}
                  className={cn(
                    "border-b border-slate-100 transition-colors",
                    isAssigned
                      ? "cursor-not-allowed bg-slate-50/80 text-slate-500"
                      : "bg-white hover:bg-slate-50",
                  )}
                >
                  <td className={TABLE_CELL_CLASS}>
                    {trainer.profileImageUrl ? (
                      <Image
                        src={trainer.profileImageUrl}
                        alt=""
                        width={44}
                        height={44}
                        className={cn(
                          "h-11 w-11 rounded-lg border border-slate-200 object-cover shadow-sm",
                          isAssigned && "opacity-60",
                        )}
                      />
                    ) : (
                      <div
                        className={cn(
                          "flex h-11 w-11 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-sm font-semibold text-slate-500",
                          isAssigned && "opacity-60",
                        )}
                      >
                        {displayName.charAt(0) || "?"}
                      </div>
                    )}
                  </td>
                  <td className={`${TABLE_CELL_CLASS} font-medium text-[#102A56]`}>
                    <span
                      className={cn(
                        "block truncate",
                        isAssigned && "text-slate-500",
                      )}
                      title={displayName}
                    >
                      {displayName}
                    </span>
                    {trainer.employeeCode ? (
                      <p className="truncate text-xs text-slate-500">
                        {trainer.employeeCode}
                      </p>
                    ) : null}
                  </td>
                  <td className={`${TABLE_CELL_CLASS} text-slate-700`}>
                    <span className="block truncate">
                      {trainer.qualification?.trim() || "—"}
                    </span>
                  </td>
                  <td className={`${TABLE_CELL_CLASS} text-slate-700`}>
                    <span className="block truncate">
                      {trainer.specialization?.trim() || "—"}
                    </span>
                  </td>
                  <td className={TABLE_CELL_CLASS}>
                    <TrainerStatusBadge status={trainer.status} />
                  </td>
                  <td className={TABLE_CELL_CLASS}>
                    <div className="flex items-center justify-end">
                      {isAssigned ? (
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          {ALREADY_ASSIGNED_LABEL}
                        </span>
                      ) : branchCourses.length === 0 ? (
                        <span className="text-xs text-slate-400">
                          No branch courses
                        </span>
                      ) : (
                        <Dropdown
                          trigger={
                            <Button
                              type="button"
                              size="sm"
                              disabled={!canAssignTrainers}
                              className="h-9 shrink-0 px-3"
                            >
                              <Plus className="mr-1.5 h-4 w-4" />
                              Assign Trainer
                              <ChevronDown className="ml-1.5 h-4 w-4" />
                            </Button>
                          }
                          items={branchCourses.map((course) => ({
                            label: course.title,
                            onClick: () =>
                              setAssignTarget({
                                trainer,
                                courseId: course.id,
                                courseTitle: course.title,
                              }),
                          }))}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </BranchManageTableShell>

          {!isLoading && total > 0 ? (
            <div className={BRANCH_PAGINATION_FOOTER_CLASS}>
              <p className="text-xs text-[#647A9B]">
                Showing {from}–{to} of {total}
              </p>
              <CategoryPagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          ) : null}
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(assignTarget)}
        title="Assign trainer to course?"
        description={
          assignTarget
            ? `Assign ${formatTrainerDisplayName(assignTarget.trainer)} to "${assignTarget.courseTitle}"?`
            : undefined
        }
        confirmLabel="Assign Trainer"
        loading={assignLoading}
        onCancel={() => {
          if (!assignLoading) {
            setAssignTarget(null);
          }
        }}
        onConfirm={() => {
          void handleAssign();
        }}
      />
    </>
  );
}
