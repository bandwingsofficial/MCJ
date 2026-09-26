"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { GraduationCap, Link2Off } from "lucide-react";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { CategoryPagination } from "@/src/features/categories/components/category-pagination";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { AssignBranchTrainerModal } from "@/src/features/branches/components/manage/assign-branch-trainer-modal";
import { BranchIconAction } from "@/src/features/branches/components/manage/branch-icon-action";
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
  filterBranchTrainerAssignments,
  formatBranchTrainerTimingLabel,
  formatTrainerDisplayName,
  getAssignmentTypeLabel,
  getBranchOnlyAssignedTrainerIds,
  loadBranchTrainerAssignments,
} from "@/src/features/branches/utils/branch-trainer-relation.utils";
import { branchService } from "@/src/features/branches/services/branch.service";
import type {
  AssignBranchTrainersPayload,
  BranchTrainerAssignment,
} from "@/src/features/branches/types/branch.types";
import { DEFAULT_TRAINER_PAGE_SIZE } from "@/src/features/trainers/constants/trainer.constants";
import { TrainerStatusBadge } from "@/src/features/trainers/components/trainer-status-badge";
import { getTrainerDisplayStatus } from "@/src/features/trainers/utils/trainer-display.utils";
import type { BatchMode } from "@/src/features/batches/types/batch.types";
import { getBatchModeLabel } from "@/src/features/batches/utils/batch-mode.utils";

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
  const [assignments, setAssignments] = useState<BranchTrainerAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignSubmitting, setAssignSubmitting] = useState(false);

  const [unassignTarget, setUnassignTarget] =
    useState<BranchTrainerAssignment | null>(null);
  const [unassignLoading, setUnassignLoading] = useState(false);

  const pageSize = DEFAULT_TRAINER_PAGE_SIZE;

  const filteredAssignments = useMemo(
    () => filterBranchTrainerAssignments(assignments, search),
    [assignments, search],
  );

  const total = filteredAssignments.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const paginatedAssignments = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredAssignments.slice(start, start + pageSize);
  }, [filteredAssignments, page, pageSize]);

  const branchOnlyAssignedTrainerIds = useMemo(
    () => getBranchOnlyAssignedTrainerIds(assignments),
    [assignments],
  );

  const loadData = useCallback(async () => {
    if (!branchId) {
      setAssignments([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      setAssignments(await loadBranchTrainerAssignments(branchId));
    } catch (loadError) {
      const message = getErrorMessage(loadError);
      setError(message);
      setAssignments([]);
      appToast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [branchId]);

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

  const closeAssignModal = () => {
    if (assignSubmitting) {
      return;
    }

    setAssignOpen(false);
  };

  const handleAssign = async (payload: AssignBranchTrainersPayload) => {
    setAssignSubmitting(true);
    try {
      const result = await branchService.assignTrainers(branchId, payload);
      const count = result.data?.assignedCount ?? payload.trainerIds.length;
      appToast.success(
        count === 1
          ? "Trainer assigned successfully"
          : `${count} trainers assigned successfully`,
      );
      setAssignOpen(false);
      await loadData();
      await onSummaryRefresh?.();
    } catch (assignError) {
      appToast.error(getErrorMessage(assignError));
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
      await branchService.unassignTrainerAssignment(
        branchId,
        unassignTarget.id,
      );
      appToast.success("Trainer unassigned");
      setUnassignTarget(null);
      await loadData();
      await onSummaryRefresh?.();
    } catch (unassignError) {
      appToast.error(getErrorMessage(unassignError));
    } finally {
      setUnassignLoading(false);
    }
  };

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  if (error && assignments.length === 0 && !isLoading) {
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
                Total Assignments:
                <span className="ml-1 font-semibold tabular-nums text-[#647A9B]">
                  {isLoading ? "—" : assignments.length}
                </span>
              </span>
            </div>

            <BranchSectionToolbar
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder="Search trainers..."
              assignLabel="Assign Trainer"
              assignDisabled={assignmentsDisabled}
              onAssign={() => setAssignOpen(true)}
            />
          </div>
        </header>

        <div className={BRANCH_TABLE_CARD_CLASS}>
          <BranchManageTableShell
            embedded
            columns={[
              { key: "profile", label: "Profile", className: "w-[4rem]" },
              { key: "name", label: "Trainer", className: "min-w-[9rem]" },
              { key: "course", label: "Course", className: "min-w-[8rem]" },
              { key: "batch", label: "Batch", className: "min-w-[8rem]" },
              { key: "mode", label: "Mode", className: "w-[7rem]" },
              { key: "timing", label: "Batch Timing", className: "min-w-[10rem]" },
              { key: "type", label: "Assignment", className: "w-[7.5rem]" },
              { key: "status", label: "Status", className: "w-[7rem]" },
              {
                key: "actions",
                label: "Actions",
                className: "w-[6rem] text-right",
              },
            ]}
            isLoading={isLoading}
            isEmpty={!isLoading && total === 0}
            emptyTitle="No Trainers Assigned Yet"
            emptyDescription="Assign trainers to this branch to get started."
            emptyIcon={GraduationCap}
          >
            {paginatedAssignments.map((row) => {
              const displayName =
                formatTrainerDisplayName(row.trainer) || "Unnamed trainer";
              const isBranchOnly = row.assignmentType === "BRANCH_ONLY";

              return (
                <tr
                  key={row.id}
                  className="border-b border-slate-100 bg-white transition-colors hover:bg-slate-50"
                >
                  <td className={TABLE_CELL_CLASS}>
                    {row.trainer.profileImageUrl ? (
                      <Image
                        src={row.trainer.profileImageUrl}
                        alt=""
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-lg border border-slate-200 object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-sm font-semibold text-slate-500">
                        {displayName.charAt(0) || "?"}
                      </div>
                    )}
                  </td>
                  <td className={`${TABLE_CELL_CLASS} font-medium text-[#102A56]`}>
                    <span className="block truncate" title={displayName}>
                      {displayName}
                    </span>
                  </td>
                  <td className={`${TABLE_CELL_CLASS} text-slate-700`}>
                    <span className="block truncate">
                      {isBranchOnly ? "" : (row.course?.title ?? "")}
                    </span>
                  </td>
                  <td className={`${TABLE_CELL_CLASS} text-slate-700`}>
                    <span className="block truncate">
                      {isBranchOnly ? "" : (row.batch?.name ?? "")}
                    </span>
                  </td>
                  <td className={`${TABLE_CELL_CLASS} text-slate-700`}>
                    {isBranchOnly
                      ? ""
                      : row.mode
                        ? getBatchModeLabel(row.mode as BatchMode)
                        : ""}
                  </td>
                  <td className={`${TABLE_CELL_CLASS} text-slate-700`}>
                    <span className="block truncate text-xs">
                      {isBranchOnly
                        ? ""
                        : formatBranchTrainerTimingLabel(row.batchTiming)}
                    </span>
                  </td>
                  <td className={`${TABLE_CELL_CLASS} text-slate-700`}>
                    {getAssignmentTypeLabel(row.assignmentType)}
                  </td>
                  <td className={TABLE_CELL_CLASS}>
                    <TrainerStatusBadge
                      status={getTrainerDisplayStatus(row.trainer)}
                    />
                  </td>
                  <td className={TABLE_CELL_CLASS}>
                    <div className="flex items-center justify-end">
                      <BranchIconAction
                        icon={Link2Off}
                        label="Unassign"
                        destructive
                        disabled={
                          assignmentsDisabled ||
                          unassignLoading ||
                          assignSubmitting
                        }
                        onClick={() => setUnassignTarget(row)}
                      />
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

      <AssignBranchTrainerModal
        open={assignOpen}
        branchId={branchId}
        branchOnlyAssignedTrainerIds={branchOnlyAssignedTrainerIds}
        isSubmitting={assignSubmitting}
        onClose={closeAssignModal}
        onAssign={handleAssign}
      />

      <ConfirmDialog
        open={Boolean(unassignTarget)}
        title="Unassign trainer?"
        description={`Remove ${formatTrainerDisplayName(unassignTarget?.trainer ?? { firstName: "this trainer", lastName: null })} from this branch assignment? Other branch or course/batch assignments will not be changed.`}
        confirmLabel="Unassign"
        loading={unassignLoading}
        onCancel={() => {
          if (!unassignLoading) {
            setUnassignTarget(null);
          }
        }}
        onConfirm={() => {
          void handleUnassign();
        }}
      />
    </>
  );
}
