"use client";

import { useCallback, useEffect, useState } from "react";

import { Card } from "@/src/shared/components/ui/card";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import {
  AssignEntitiesModal,
  type AssignableItem,
} from "@/src/features/branches/components/manage/assign-entities-modal";
import { BranchBatchCard } from "@/src/features/branches/components/manage/branch-batch-card";
import { BranchManageCardGrid } from "@/src/features/branches/components/manage/branch-manage-card-grid";
import { BranchSectionToolbar } from "@/src/features/branches/components/manage/branch-section-toolbar";
import {
  assignBatchToBranch,
  unassignBatchFromBranch,
} from "@/src/features/branches/utils/branch-assign.utils";
import { batchService } from "@/src/features/batches/services/batch.service";
import type { Batch } from "@/src/features/batches/types/batch.types";

interface Props {
  branchId: string;
  assignmentsDisabled?: boolean;
  assignOnMount?: boolean;
  onAssignOnMountHandled?: () => void;
  onSummaryRefresh?: () => Promise<void>;
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

export function BranchManageBatchesPanel({
  branchId,
  assignmentsDisabled = false,
  assignOnMount = false,
  onAssignOnMountHandled,
  onSummaryRefresh,
}: Props) {
  const [search, setSearch] = useState("");
  const [batches, setBatches] = useState<Batch[]>([]);
  const [courseTitlesByBatchId, setCourseTitlesByBatchId] = useState<
    Record<string, string[]>
  >({});
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
      const batchResponse = await batchService.getBatches({
        search,
        branchId,
        includeDeleted: false,
        page: 1,
        pageSize: 100,
      });

      const items = batchResponse.data.items ?? [];
      setBatches(items);
      setCourseTitlesByBatchId(await loadCourseTitlesByBatch(items));
    } catch (error) {
      appToast.error(getErrorMessage(error));
      setBatches([]);
      setCourseTitlesByBatchId({});
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
      const response = await batchService.getBatches({
        status: "ACTIVE",
        includeDeleted: false,
        page: 1,
        pageSize: 200,
      });
      const assigned = new Set(batches.map((item) => item.id));
      setAssignCandidates(
        (response.data.items ?? [])
          .filter(
            (item) =>
              !item.deletedAt &&
              !item.isDeleted &&
              item.isActive !== false &&
              !assigned.has(item.id) &&
              item.branchId !== branchId,
          )
          .map((item) => ({
            id: item.id,
            label: item.name,
            meta: item.code ?? undefined,
          })),
      );
    } catch (error) {
      appToast.error(getErrorMessage(error));
      setAssignOpen(false);
    } finally {
      setAssignLoading(false);
    }
  };

  useEffect(() => {
    if (!assignOnMount || assignmentsDisabled) {
      return;
    }

    void openAssign();
    onAssignOnMountHandled?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once when navigated from overview assign
  }, [assignOnMount, assignmentsDisabled, onAssignOnMountHandled]);

  const handleAssign = async (ids: string[]) => {
    if (ids.length === 0) {
      return;
    }

    setAssignSubmitting(true);
    try {
      for (const id of ids) {
        await assignBatchToBranch(id, branchId);
      }
      appToast.success(
        ids.length === 1
          ? "Batch assigned successfully"
          : `${ids.length} batches assigned successfully`,
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
      await unassignBatchFromBranch(unassignTarget.id);
      appToast.success("Batch unassigned");
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
          searchPlaceholder="Search batches..."
          assignLabel="Assign Batch"
          onAssign={() => {
            void openAssign();
          }}
          assignDisabled={assignmentsDisabled}
        />

        <BranchManageCardGrid
          isLoading={isLoading}
          isEmpty={!isLoading && batches.length === 0}
          emptyMessage="No Batches Yet"
          emptyDescription="Assign batches to this branch to get started."
          columnsClassName="grid grid-cols-1 gap-4 xl:grid-cols-2"
          skeletonCount={2}
        >
          {batches.map((batch) => (
            <BranchBatchCard
              key={batch.id}
              batch={batch}
              courseTitles={courseTitlesByBatchId[batch.id]}
              assignmentsDisabled={assignmentsDisabled}
              onUnassign={() =>
                setUnassignTarget({
                  id: batch.id,
                  label: batch.name,
                })
              }
            />
          ))}
        </BranchManageCardGrid>
      </Card>

      <AssignEntitiesModal
        open={assignOpen}
        title="Assign Batches"
        items={assignCandidates}
        isLoading={assignLoading}
        isSubmitting={assignSubmitting}
        search={assignSearch}
        onSearchChange={setAssignSearch}
        searchPlaceholder="Search batches..."
        emptyMessage="No active batches available to assign"
        onClose={() => setAssignOpen(false)}
        onAssign={handleAssign}
      />

      <ConfirmDialog
        open={Boolean(unassignTarget)}
        title="Unassign batch?"
        description={`Remove "${unassignTarget?.label ?? "this batch"}" from this branch? The batch record will not be deleted.`}
        confirmLabel="Unassign"
        loading={unassignLoading}
        onCancel={() => setUnassignTarget(null)}
        onConfirm={handleUnassign}
      />
    </>
  );
}
