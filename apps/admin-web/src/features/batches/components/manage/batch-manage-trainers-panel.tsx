"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Pagination } from "@/src/shared/components/ui/pagination";
import { SearchInput } from "@/src/shared/components/ui/search-input";
import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import type { Batch } from "@/src/features/batches/types/batch.types";
import { batchService } from "@/src/features/batches/services/batch.service";
import { formatBatchDate } from "@/src/features/batches/utils/batch.helper";
import { trainerService } from "@/src/features/trainers/services/trainer.service";
import { TrainerStatusBadge } from "@/src/features/trainers/components/trainer-status-badge";
import type {
  TrainerListItem,
  TrainerStatus,
} from "@/src/features/trainers/types/trainer.types";

import { AssignBatchTrainersModal } from "./assign-batch-trainers-modal";

interface Props {
  batch: Batch;
  disabled?: boolean;
  onUpdated: () => Promise<void>;
}

interface AssignedTrainerRow {
  id: string;
  firstName: string;
  lastName: string | null;
  employeeCode: string | null;
  email: string | null;
  phone: string | null;
  specialization: string | null;
  status: TrainerStatus;
  deletedAt: string | null;
  isDeleted: boolean;
  assignedOn: string | null;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

function formatTrainerName(
  trainer: Pick<AssignedTrainerRow, "firstName" | "lastName">,
) {
  return [trainer.firstName, trainer.lastName].filter(Boolean).join(" ");
}

function toAssignedTrainerRow(
  trainer: Batch["trainers"][number],
  detail?: TrainerListItem | null,
): AssignedTrainerRow {
  return {
    id: trainer.id,
    firstName: detail?.firstName ?? trainer.firstName,
    lastName: detail?.lastName ?? trainer.lastName,
    employeeCode: detail?.employeeCode ?? trainer.employeeCode,
    email: detail?.email ?? null,
    phone: detail?.phone ?? null,
    specialization: detail?.specialization ?? trainer.specialization ?? null,
    status: detail?.status ?? (trainer.status as TrainerStatus) ?? "INACTIVE",
    deletedAt: detail?.deletedAt ?? null,
    isDeleted: detail?.isDeleted ?? false,
    assignedOn: null,
  };
}

export function BatchManageTrainersPanel({
  batch,
  disabled = false,
  onUpdated,
}: Props) {
  const [assignedTrainers, setAssignedTrainers] = useState<AssignedTrainerRow[]>(
    [],
  );
  const [isLoadingAssigned, setIsLoadingAssigned] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [tableSearch, setTableSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_OPTIONS[1]);

  const [assignOpen, setAssignOpen] = useState(false);
  const [availableTrainers, setAvailableTrainers] = useState<TrainerListItem[]>(
    [],
  );
  const [isLoadingAvailable, setIsLoadingAvailable] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  const [unassignTarget, setUnassignTarget] =
    useState<AssignedTrainerRow | null>(null);
  const [isUnassigning, setIsUnassigning] = useState(false);

  const assignedIds = useMemo(
    () => batch.trainers.map((trainer) => trainer.id),
    [batch.trainers],
  );

  const loadAssignedTrainers = useCallback(async () => {
    setIsLoadingAssigned(true);
    setLoadError(null);

    try {
      if (batch.trainers.length === 0) {
        setAssignedTrainers([]);
        return;
      }

      const rows = await Promise.all(
        batch.trainers.map(async (trainer) => {
          try {
            const response = await trainerService.getTrainer(trainer.id);
            const detail = response.data;
            return toAssignedTrainerRow(trainer, detail);
          } catch {
            return toAssignedTrainerRow(trainer);
          }
        }),
      );

      setAssignedTrainers(rows);
    } catch (err) {
      setLoadError(getErrorMessage(err));
    } finally {
      setIsLoadingAssigned(false);
    }
  }, [batch.trainers]);

  useEffect(() => {
    void loadAssignedTrainers();
  }, [loadAssignedTrainers]);

  useEffect(() => {
    setPage(1);
  }, [tableSearch, pageSize, assignedTrainers.length]);

  const filteredAssignedTrainers = useMemo(() => {
    const query = tableSearch.trim().toLowerCase();

    if (!query) {
      return assignedTrainers;
    }

    return assignedTrainers.filter((trainer) => {
      const haystack = [
        formatTrainerName(trainer),
        trainer.employeeCode ?? "",
        trainer.email ?? "",
        trainer.phone ?? "",
        trainer.specialization ?? "",
        trainer.status,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [assignedTrainers, tableSearch]);

  const total = filteredAssignedTrainers.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const from = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, total);

  const paginatedAssignedTrainers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAssignedTrainers.slice(start, start + pageSize);
  }, [currentPage, filteredAssignedTrainers, pageSize]);

  const openAssignModal = async () => {
    setAssignOpen(true);
    setIsLoadingAvailable(true);

    try {
      const trainers = await batchService.getActiveTrainers();
      setAvailableTrainers(trainers);
    } catch (err) {
      appToast.error(getErrorMessage(err));
      setAssignOpen(false);
    } finally {
      setIsLoadingAvailable(false);
    }
  };

  const handleAssign = async (selectedIds: string[]) => {
    const uniqueIds = Array.from(new Set(selectedIds));

    try {
      setIsAssigning(true);
      await batchService.assignTrainers(batch.id, {
        trainerIds: uniqueIds,
      });
      appToast.success("Trainers assigned successfully");
      setAssignOpen(false);
      await onUpdated();
    } catch (err) {
      appToast.error(getErrorMessage(err));
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUnassign = async () => {
    if (!unassignTarget) {
      return;
    }

    const remainingIds = assignedIds.filter((id) => id !== unassignTarget.id);

    try {
      setIsUnassigning(true);
      await batchService.assignTrainers(batch.id, {
        trainerIds: remainingIds,
      });
      appToast.success("Trainer unassigned successfully");
      setUnassignTarget(null);
      await onUpdated();
    } catch (err) {
      appToast.error(getErrorMessage(err));
    } finally {
      setIsUnassigning(false);
    }
  };

  return (
    <>
      <Card className="rounded-xl border border-slate-200/80 p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Assigned Trainers
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Only active trainers can be assigned to this batch.
            </p>
          </div>

          <Button
            type="button"
            size="sm"
            disabled={disabled}
            onClick={() => {
              void openAssignModal();
            }}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Assign Trainer
          </Button>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-slate-800">
            Assigned Trainers ({assignedTrainers.length})
          </p>

          <div className="w-full sm:max-w-xs">
            <SearchInput
              value={tableSearch}
              placeholder="Search trainers..."
              onChange={setTableSearch}
            />
          </div>
        </div>

        {loadError ? (
          <div className="mt-4">
            <ErrorState
              title="Failed to load assigned trainers"
              description={loadError}
              onRetry={() => {
                void loadAssignedTrainers();
              }}
            />
          </div>
        ) : isLoadingAssigned ? (
          <div className="mt-4">
            <SkeletonTable rows={5} />
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[960px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {[
                    "Trainer",
                    "Employee Code",
                    "Email",
                    "Phone",
                    "Specialization",
                    "Assigned On",
                    "Status",
                    "Actions",
                  ].map((label) => (
                    <th
                      key={label}
                      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 ${
                        label === "Actions" ? "text-right" : "text-left"
                      }`}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {paginatedAssignedTrainers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center">
                      <p className="text-sm font-medium text-slate-700">
                        No trainers assigned yet
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Assign an active trainer to this batch to get started.
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedAssignedTrainers.map((trainer) => (
                    <tr
                      key={trainer.id}
                      className="transition-colors hover:bg-slate-50"
                    >
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-slate-900">
                          {formatTrainerName(trainer) || "—"}
                        </p>
                      </td>

                      <td className="px-4 py-3 text-sm text-slate-700">
                        {trainer.employeeCode ?? "—"}
                      </td>

                      <td className="min-w-0 px-4 py-3">
                        <p className="truncate text-sm text-slate-700">
                          {trainer.email ?? "—"}
                        </p>
                      </td>

                      <td className="px-4 py-3 text-sm text-slate-700">
                        {trainer.phone ?? "—"}
                      </td>

                      <td className="min-w-0 px-4 py-3">
                        <p className="truncate text-sm text-slate-700">
                          {trainer.specialization?.trim() || "—"}
                        </p>
                      </td>

                      <td className="px-4 py-3 text-sm text-slate-700">
                        {trainer.assignedOn
                          ? formatBatchDate(trainer.assignedOn)
                          : "—"}
                      </td>

                      <td className="px-4 py-3">
                        <TrainerStatusBadge
                          status={trainer.status}
                          deletedAt={trainer.deletedAt}
                          isDeleted={trainer.isDeleted}
                        />
                      </td>

                      <td className="px-4 py-3 text-right">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={disabled || isUnassigning}
                          className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => setUnassignTarget(trainer)}
                        >
                          Unassign
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {!loadError && !isLoadingAssigned && total > 0 ? (
          <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
              <span>
                Showing {from}–{to} of {total}
              </span>
              <label className="flex items-center gap-2">
                <span className="whitespace-nowrap">Rows per page</span>
                <select
                  className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-sm"
                  value={pageSize}
                  onChange={(event) => setPageSize(Number(event.target.value))}
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <Pagination
              page={currentPage}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        ) : null}
      </Card>

      <AssignBatchTrainersModal
        open={assignOpen}
        assignedIds={assignedIds}
        trainers={availableTrainers}
        isLoading={isLoadingAvailable}
        isSubmitting={isAssigning}
        onClose={() => {
          if (!isAssigning) {
            setAssignOpen(false);
          }
        }}
        onAssign={handleAssign}
      />

      <ConfirmDialog
        open={Boolean(unassignTarget)}
        title="Unassign Trainer?"
        description={
          unassignTarget
            ? `Are you sure you want to remove ${formatTrainerName(unassignTarget)} from this batch?`
            : ""
        }
        confirmLabel="Unassign"
        loading={isUnassigning}
        onCancel={() => {
          if (!isUnassigning) {
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
