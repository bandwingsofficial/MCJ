"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { GraduationCap, Link2Off } from "lucide-react";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { CategoryPagination } from "@/src/features/categories/components/category-pagination";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";
import { cn } from "@/src/shared/lib/cn";

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
  collectAssignedTrainerIdsForBranch,
  filterAssignedBranchTrainers,
  formatTrainerDisplayName,
  getBranchAssignedTrainerIds,
  isTrainerAssignedViaBranchCourses,
  loadBranchAssignedTrainers,
} from "@/src/features/branches/utils/branch-trainer-relation.utils";
import { DEFAULT_TRAINER_PAGE_SIZE } from "@/src/features/trainers/constants/trainer.constants";
import { TrainerStatusBadge } from "@/src/features/trainers/components/trainer-status-badge";
import { trainerService } from "@/src/features/trainers/services/trainer.service";
import type { TrainerListItem } from "@/src/features/trainers/types/trainer.types";

const ALREADY_ASSIGNED_LABEL = "ALREADY ASSIGNED";

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
  const [assignedTrainers, setAssignedTrainers] = useState<TrainerListItem[]>(
    [],
  );
  const [courseAssignedTrainerIds, setCourseAssignedTrainerIds] = useState<
    Set<string>
  >(new Set());
  const [manualBranchTrainerIds, setManualBranchTrainerIds] = useState<
    Set<string>
  >(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [availableTrainers, setAvailableTrainers] = useState<TrainerListItem[]>(
    [],
  );
  const [modalAssignedTrainerIds, setModalAssignedTrainerIds] = useState<
    string[]
  >([]);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignModalLoading, setAssignModalLoading] = useState(false);
  const [assignSubmitting, setAssignSubmitting] = useState(false);

  const [unassignTarget, setUnassignTarget] = useState<TrainerListItem | null>(
    null,
  );
  const [unassignLoading, setUnassignLoading] = useState(false);

  const pageSize = DEFAULT_TRAINER_PAGE_SIZE;

  const filteredTrainers = useMemo(
    () => filterAssignedBranchTrainers(assignedTrainers, search),
    [assignedTrainers, search],
  );

  const total = filteredTrainers.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const paginatedTrainers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredTrainers.slice(start, start + pageSize);
  }, [filteredTrainers, page, pageSize]);

  const assignedTrainerIds = useMemo(
    () =>
      collectAssignedTrainerIdsForBranch(
        assignedTrainers,
        branchId,
        courseAssignedTrainerIds,
      ),
    [assignedTrainers, branchId, courseAssignedTrainerIds],
  );

  const loadData = useCallback(async () => {
    if (!branchId) {
      setAssignedTrainers([]);
      setCourseAssignedTrainerIds(new Set());
      setManualBranchTrainerIds(new Set());
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const {
        trainers,
        courseAssignedTrainerIds: courseTrainerIds,
        manualBranchTrainerIds: manualTrainerIds,
      } = await loadBranchAssignedTrainers(branchId);

      setAssignedTrainers(trainers);
      setCourseAssignedTrainerIds(courseTrainerIds);
      setManualBranchTrainerIds(manualTrainerIds);
    } catch (loadError) {
      const message = getErrorMessage(loadError);
      setError(message);
      setAssignedTrainers([]);
      setCourseAssignedTrainerIds(new Set());
      setManualBranchTrainerIds(new Set());
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

  const loadAvailableTrainers = useCallback(async () => {
    setAssignModalLoading(true);
    try {
      const [
        {
          courseAssignedTrainerIds: courseIds,
          manualBranchTrainerIds: manualIds,
        },
        activeTrainers,
      ] = await Promise.all([
        loadBranchAssignedTrainers(branchId),
        trainerService.getActiveTrainersForAssignment(),
      ]);

      setAvailableTrainers(activeTrainers);
      setModalAssignedTrainerIds(
        Array.from(getBranchAssignedTrainerIds(courseIds, manualIds)),
      );
    } catch (loadError) {
      appToast.error(getErrorMessage(loadError));
      setAssignOpen(false);
    } finally {
      setAssignModalLoading(false);
    }
  }, [branchId]);

  const openAssignModal = async () => {
    setModalAssignedTrainerIds(
      Array.from(
        getBranchAssignedTrainerIds(
          courseAssignedTrainerIds,
          manualBranchTrainerIds,
        ),
      ),
    );
    setAssignOpen(true);
    await loadAvailableTrainers();
  };

  const closeAssignModal = () => {
    if (assignSubmitting) {
      return;
    }

    setAssignOpen(false);
  };

  const handleAssign = async (trainerIds: string[]) => {
    const uniqueTrainerIds = Array.from(new Set(trainerIds)).filter(
      (trainerId) => !assignedTrainerIds.has(trainerId),
    );

    if (uniqueTrainerIds.length === 0) {
      appToast.error("Selected trainers are already assigned to this branch.");
      return;
    }

    setAssignSubmitting(true);
    try {
      await Promise.all(
        uniqueTrainerIds.map((trainerId) =>
          trainerService.updateTrainer(trainerId, { branchId }),
        ),
      );
      appToast.success(
        uniqueTrainerIds.length === 1
          ? "Trainer assigned successfully"
          : `${uniqueTrainerIds.length} trainers assigned successfully`,
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

    if (
      isTrainerAssignedViaBranchCourses(
        unassignTarget.id,
        courseAssignedTrainerIds,
      )
    ) {
      appToast.error(
        "This trainer is assigned through a course and cannot be unassigned here.",
      );
      setUnassignTarget(null);
      return;
    }

    if (!manualBranchTrainerIds.has(unassignTarget.id)) {
      appToast.error("This trainer is not manually assigned to this branch.");
      setUnassignTarget(null);
      return;
    }

    setUnassignLoading(true);
    try {
      await trainerService.updateTrainer(unassignTarget.id, { branchId: null });
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

  if (error && assignedTrainers.length === 0 && !isLoading) {
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
                Total Trainers:
                <span className="ml-1 font-semibold tabular-nums text-[#647A9B]">
                  {isLoading ? "—" : assignedTrainers.length}
                </span>
              </span>
            </div>

            <BranchSectionToolbar
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder="Search trainers..."
              assignLabel="Assign Trainer"
              assignDisabled={assignmentsDisabled}
              onAssign={() => {
                void openAssignModal();
              }}
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
                className: "w-[10.5rem] text-right",
              },
            ]}
            isLoading={isLoading}
            isEmpty={!isLoading && total === 0}
            emptyTitle="No Trainers Assigned Yet"
            emptyDescription="Assign trainers to this branch to get started."
            emptyIcon={GraduationCap}
          >
            {paginatedTrainers.map((trainer) => {
              const displayName =
                formatTrainerDisplayName(trainer) || "Unnamed trainer";
              const isCourseAssigned = isTrainerAssignedViaBranchCourses(
                trainer.id,
                courseAssignedTrainerIds,
              );
              const canUnassign =
                manualBranchTrainerIds.has(trainer.id) && !isCourseAssigned;

              return (
                <tr
                  key={trainer.id}
                  className={cn(
                    "border-b border-slate-100 transition-colors",
                    isCourseAssigned
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
                          isCourseAssigned && "opacity-60",
                        )}
                      />
                    ) : (
                      <div
                        className={cn(
                          "flex h-11 w-11 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-sm font-semibold text-slate-500",
                          isCourseAssigned && "opacity-60",
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
                        isCourseAssigned && "text-slate-500",
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
                      {isCourseAssigned ? (
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          {ALREADY_ASSIGNED_LABEL}
                        </span>
                      ) : canUnassign ? (
                        <BranchIconAction
                          icon={Link2Off}
                          label="Unassign"
                          destructive
                          disabled={
                            assignmentsDisabled ||
                            unassignLoading ||
                            assignSubmitting
                          }
                          onClick={() => setUnassignTarget(trainer)}
                        />
                      ) : null}
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
        trainers={availableTrainers}
        assignedTrainerIds={modalAssignedTrainerIds}
        isLoading={assignModalLoading}
        isSubmitting={assignSubmitting}
        onClose={closeAssignModal}
        onAssign={handleAssign}
      />

      <ConfirmDialog
        open={Boolean(unassignTarget)}
        title="Unassign trainer?"
        description={`Remove ${formatTrainerDisplayName(unassignTarget ?? { firstName: "this trainer", lastName: null })} from this branch? Course assignments will not be changed.`}
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
