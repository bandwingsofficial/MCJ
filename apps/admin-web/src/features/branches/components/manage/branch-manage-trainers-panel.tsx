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
  filterAssignedBranchTrainers,
  formatTrainerDisplayName,
  loadBranchAssignedTrainerIds,
  loadBranchAssignedTrainers,
} from "@/src/features/branches/utils/branch-trainer-relation.utils";
import { branchService } from "@/src/features/branches/services/branch.service";
import { DEFAULT_TRAINER_PAGE_SIZE } from "@/src/features/trainers/constants/trainer.constants";
import { TrainerStatusBadge } from "@/src/features/trainers/components/trainer-status-badge";
import { trainerService } from "@/src/features/trainers/services/trainer.service";
import type { TrainerListItem } from "@/src/features/trainers/types/trainer.types";

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
    () => new Set(assignedTrainers.map((trainer) => trainer.id)),
    [assignedTrainers],
  );

  const loadData = useCallback(async () => {
    if (!branchId) {
      setAssignedTrainers([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const trainers = await loadBranchAssignedTrainers(branchId);
      setAssignedTrainers(trainers);
    } catch (loadError) {
      const message = getErrorMessage(loadError);
      setError(message);
      setAssignedTrainers([]);
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
      const [assignedIds, activeTrainers] = await Promise.all([
        loadBranchAssignedTrainerIds(branchId),
        trainerService.getActiveTrainersForAssignment(),
      ]);

      setAvailableTrainers(activeTrainers);
      setModalAssignedTrainerIds(assignedIds);
    } catch (loadError) {
      appToast.error(getErrorMessage(loadError));
      setAssignOpen(false);
    } finally {
      setAssignModalLoading(false);
    }
  }, [branchId]);

  const openAssignModal = async () => {
    setModalAssignedTrainerIds(assignedTrainers.map((trainer) => trainer.id));
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
      await branchService.assignTrainers(branchId, uniqueTrainerIds);
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

    setUnassignLoading(true);
    try {
      await branchService.unassignTrainer(branchId, unassignTarget.id);
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

              return (
                <tr
                  key={trainer.id}
                  className="border-b border-slate-100 bg-white transition-colors hover:bg-slate-50"
                >
                  <td className={TABLE_CELL_CLASS}>
                    {trainer.profileImageUrl ? (
                      <Image
                        src={trainer.profileImageUrl}
                        alt=""
                        width={44}
                        height={44}
                        className="h-11 w-11 rounded-lg border border-slate-200 object-cover shadow-sm"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-sm font-semibold text-slate-500">
                        {displayName.charAt(0) || "?"}
                      </div>
                    )}
                  </td>
                  <td className={`${TABLE_CELL_CLASS} font-medium text-[#102A56]`}>
                    <span className="block truncate" title={displayName}>
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
        description={`Remove ${formatTrainerDisplayName(unassignTarget ?? { firstName: "this trainer", lastName: null })} from this branch? This only removes the branch assignment.`}
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
