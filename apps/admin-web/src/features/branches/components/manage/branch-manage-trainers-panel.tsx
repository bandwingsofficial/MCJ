"use client";

import { useCallback, useEffect, useState } from "react";
import { Link2Off } from "lucide-react";

import { Card } from "@/src/shared/components/ui/card";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import {
  AssignEntitiesModal,
  type AssignableItem,
} from "@/src/features/branches/components/manage/assign-entities-modal";
import { BranchIconAction } from "@/src/features/branches/components/manage/branch-icon-action";
import { BranchManageTableShell } from "@/src/features/branches/components/manage/branch-manage-table-shell";
import { BranchSectionToolbar } from "@/src/features/branches/components/manage/branch-section-toolbar";
import { formatPersonName } from "@/src/features/branches/utils/branch-display.utils";
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
  const [trainers, setTrainers] = useState<TrainerListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignSearch, setAssignSearch] = useState("");
  const [assignCandidates, setAssignCandidates] = useState<AssignableItem[]>(
    [],
  );
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignSubmitting, setAssignSubmitting] = useState(false);

  const [unassignTarget, setUnassignTarget] = useState<{
    id: string;
    label: string;
  } | null>(null);
  const [unassignLoading, setUnassignLoading] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await trainerService.getTrainers({
        search,
        branchId,
        status: "ACTIVE",
        page: 1,
        pageSize: 100,
        isDeleted: false,
      });
      setTrainers(response.data.items ?? []);
    } catch (error) {
      appToast.error(getErrorMessage(error));
      setTrainers([]);
    } finally {
      setIsLoading(false);
    }
  }, [branchId, search]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const openAssign = async () => {
    setAssignOpen(true);
    setAssignSearch("");
    setAssignLoading(true);
    try {
      const response = await trainerService.getTrainers({
        status: "ACTIVE",
        page: 1,
        pageSize: 100,
        isDeleted: false,
      });
      const assigned = new Set(trainers.map((item) => item.id));
      setAssignCandidates(
        (response.data.items ?? [])
          .filter(
            (item) =>
              item.status === "ACTIVE" &&
              !item.deletedAt &&
              !assigned.has(item.id) &&
              (item.branchId == null ||
                item.branchId === "" ||
                item.branchId !== branchId),
          )
          .map((item) => ({
            id: item.id,
            label: formatPersonName(item.firstName, item.lastName),
            meta: item.email ?? item.employeeCode ?? undefined,
          })),
      );
    } catch (error) {
      appToast.error(getErrorMessage(error));
      setAssignOpen(false);
    } finally {
      setAssignLoading(false);
    }
  };

  const handleAssign = async (ids: string[]) => {
    if (ids.length === 0) {
      return;
    }

    setAssignSubmitting(true);
    try {
      for (const id of ids) {
        await trainerService.updateTrainer(id, { branchId });
      }
      appToast.success(
        ids.length === 1
          ? "Trainer assigned successfully"
          : `${ids.length} trainers assigned successfully`,
      );
      setAssignOpen(false);
      await loadData();
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
      await trainerService.updateTrainer(unassignTarget.id, {
        branchId: null,
      });
      appToast.success("Trainer unassigned");
      setUnassignTarget(null);
      await loadData();
      await onSummaryRefresh?.();
    } catch (error) {
      appToast.error(getErrorMessage(error));
    } finally {
      setUnassignLoading(false);
    }
  };

  return (
    <>
      <Card className="rounded-xl border border-slate-200 p-4 shadow-sm">
        <BranchSectionToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search trainers..."
          assignLabel="Assign Trainer"
          onAssign={() => {
            void openAssign();
          }}
          assignDisabled={assignmentsDisabled}
        />

        <BranchManageTableShell
          columns={[
            { key: "name", label: "Trainer" },
            { key: "email", label: "Email" },
            { key: "status", label: "Status", className: "w-[8rem]" },
            {
              key: "actions",
              label: "Actions",
              className: "w-[4.5rem] text-right",
            },
          ]}
          isLoading={isLoading}
          isEmpty={!isLoading && trainers.length === 0}
          emptyMessage="No trainers assigned yet"
          emptyDescription="Assign trainers to this branch to get started."
        >
          {trainers.map((trainer) => (
            <tr key={trainer.id} className="hover:bg-slate-50">
              <td className="truncate px-4 py-3 text-sm font-medium text-slate-900">
                {formatPersonName(trainer.firstName, trainer.lastName)}
              </td>
              <td className="truncate px-4 py-3 text-sm text-slate-700">
                {trainer.email ?? ""}
              </td>
              <td className="px-4 py-3">
                <TrainerStatusBadge status={trainer.status} />
              </td>
              <td className="px-4 py-3 text-right">
                <BranchIconAction
                  icon={Link2Off}
                  label="Unassign trainer"
                  destructive
                  disabled={assignmentsDisabled}
                  onClick={() =>
                    setUnassignTarget({
                      id: trainer.id,
                      label: formatPersonName(
                        trainer.firstName,
                        trainer.lastName,
                      ),
                    })
                  }
                />
              </td>
            </tr>
          ))}
        </BranchManageTableShell>
      </Card>

      <AssignEntitiesModal
        open={assignOpen}
        title="Assign Trainers"
        items={assignCandidates}
        isLoading={assignLoading}
        isSubmitting={assignSubmitting}
        search={assignSearch}
        onSearchChange={setAssignSearch}
        searchPlaceholder="Search trainers..."
        emptyMessage="No active trainers available to assign"
        onClose={() => setAssignOpen(false)}
        onAssign={handleAssign}
      />

      <ConfirmDialog
        open={Boolean(unassignTarget)}
        title="Unassign trainer?"
        description={`Remove "${unassignTarget?.label ?? "this trainer"}" from this branch? The trainer record will not be deleted.`}
        confirmLabel="Unassign"
        loading={unassignLoading}
        onCancel={() => setUnassignTarget(null)}
        onConfirm={handleUnassign}
      />
    </>
  );
}
