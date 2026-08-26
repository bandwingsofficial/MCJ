"use client";

import { useCallback, useEffect, useState } from "react";
import { Eye, Link2Off, Plus } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import {
  AssignEntitiesModal,
  type AssignableItem,
} from "@/src/features/branches/components/manage/assign-entities-modal";
import { BranchBatchFiltersBar } from "@/src/features/branches/components/manage/branch-batch-filters";
import { BranchIconAction } from "@/src/features/branches/components/manage/branch-icon-action";
import { BranchManageTableShell } from "@/src/features/branches/components/manage/branch-manage-table-shell";
import {
  assignBatchToBranch,
  unassignBatchFromBranch,
} from "@/src/features/branches/utils/branch-assign.utils";
import { BatchModeBadge } from "@/src/features/batches/components/BatchModeBadge";
import { BatchStatusBadge } from "@/src/features/batches/components/BatchStatusBadge";
import { batchService } from "@/src/features/batches/services/batch.service";
import type { Batch, BatchFilters } from "@/src/features/batches/types/batch.types";
import { categoryService } from "@/src/features/categories/services/category.service";
import type { CategoryListItem } from "@/src/features/categories/types/category.types";

interface Props {
  branchId: string;
  assignmentsDisabled?: boolean;
  assignOnMount?: boolean;
  onAssignOnMountHandled?: () => void;
  onSummaryRefresh?: () => Promise<void>;
}

interface BatchDisplayMeta {
  categoryLabel: string;
}

async function loadBatchDisplayMeta(
  batches: Batch[],
): Promise<Record<string, BatchDisplayMeta>> {
  const entries = await Promise.all(
    batches.map(async (batch) => {
      try {
        const assignments = await batchService.getBatchCourses(batch.id);
        const categories = Array.from(
          new Set(
            assignments
              .map((item) => item.course?.category?.name?.trim())
              .filter((name): name is string => Boolean(name)),
          ),
        );

        return [
          batch.id,
          {
            categoryLabel:
              categories.join(", ") || batch.category?.name?.trim() || "",
          },
        ] as const;
      } catch {
        return [
          batch.id,
          {
            categoryLabel: batch.category?.name?.trim() || "",
          },
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
  const [filters, setFilters] = useState<BatchFilters>({
    search: "",
    includeDeleted: false,
  });
  const [batches, setBatches] = useState<Batch[]>([]);
  const [displayMetaByBatchId, setDisplayMetaByBatchId] = useState<
    Record<string, BatchDisplayMeta>
  >({});
  const [categoryOptions, setCategoryOptions] = useState<CategoryListItem[]>(
    [],
  );
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

  const loadCategories = useCallback(async () => {
    try {
      const categoryResponse = await categoryService.getCategories({
        search: "",
        status: "ACTIVE",
        page: 1,
        pageSize: 100,
      });
      setCategoryOptions(
        (categoryResponse.data ?? []).filter((item) => !item.isDeleted),
      );
    } catch {
      setCategoryOptions([]);
    }
  }, []);

  const loadData = useCallback(async () => {
    if (!branchId) {
      setBatches([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const batchResponse = await batchService.getBatches({
        search: filters.search,
        branchId,
        mode: filters.mode,
        categoryId: filters.categoryId,
        status: filters.status,
        includeDeleted: filters.status === "ARCHIVED",
        page: 1,
        pageSize: 100,
      });

      const items = batchResponse.data.items ?? [];
      setBatches(items);
      setDisplayMetaByBatchId(await loadBatchDisplayMeta(items));
    } catch (error) {
      appToast.error(getErrorMessage(error));
      setBatches([]);
      setDisplayMetaByBatchId({});
    } finally {
      setIsLoading(false);
    }
  }, [branchId, filters]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const openAssign = async () => {
    if (!branchId) {
      return;
    }

    setAssignOpen(true);
    setAssignSearch("");
    setAssignLoading(true);
    try {
      const [assignedResponse, availableResponse] = await Promise.all([
        batchService.getBatches({
          branchId,
          includeDeleted: false,
          page: 1,
          pageSize: 100,
        }),
        batchService.getBatches({
          status: "ACTIVE",
          isActive: true,
          includeDeleted: false,
          isDeleted: false,
          page: 1,
          pageSize: 100,
        }),
      ]);
      const assigned = new Set(
        (assignedResponse.data.items ?? []).map((item) => item.id),
      );
      setAssignCandidates(
        (availableResponse.data.items ?? [])
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
    if (ids.length === 0 || !branchId) {
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
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Batches</h2>
          <Button
            type="button"
            size="sm"
            disabled={assignmentsDisabled}
            onClick={() => {
              void openAssign();
            }}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Assign Batch
          </Button>
        </div>

        <div className="mb-3">
          <BranchBatchFiltersBar
            filters={filters}
            categories={categoryOptions}
            onChange={setFilters}
          />
        </div>

        <BranchManageTableShell
          columns={[
            { key: "batch", label: "Batch" },
            { key: "mode", label: "Mode", className: "w-[8rem]" },
            { key: "category", label: "Category" },
            { key: "status", label: "Status", className: "w-[8rem]" },
            {
              key: "actions",
              label: "Actions",
              className: "w-[6.5rem] text-right",
            },
          ]}
          isLoading={isLoading}
          isEmpty={!isLoading && batches.length === 0}
          emptyMessage="No Batches Yet"
          emptyDescription="Assign batches to this branch to get started."
        >
          {batches.map((batch) => (
            <tr key={batch.id} className="hover:bg-slate-50">
              <td className="px-4 py-3">
                <p className="truncate text-sm font-medium text-slate-900">
                  {batch.name}
                </p>
                {batch.code ? (
                  <p className="truncate font-mono text-xs text-slate-500">
                    {batch.code}
                  </p>
                ) : null}
              </td>
              <td className="px-4 py-3">
                <BatchModeBadge mode={batch.mode} />
              </td>
              <td className="truncate px-4 py-3 text-sm text-slate-700">
                {displayMetaByBatchId[batch.id]?.categoryLabel ||
                  batch.category?.name ||
                  ""}
              </td>
              <td className="px-4 py-3">
                <BatchStatusBadge
                  status={batch.status}
                  isActive={batch.isActive}
                  isDeleted={Boolean(batch.isDeleted || batch.deletedAt)}
                />
              </td>
              <td className="px-4 py-3 text-right">
                <div className="inline-flex items-center justify-end gap-1">
                  <BranchIconAction
                    icon={Eye}
                    label="View batch"
                    href={`/batches/${batch.id}/manage`}
                  />
                  <BranchIconAction
                    icon={Link2Off}
                    label="Unassign"
                    destructive
                    disabled={assignmentsDisabled || unassignLoading}
                    onClick={() =>
                      setUnassignTarget({
                        id: batch.id,
                        label: batch.name,
                      })
                    }
                  />
                </div>
              </td>
            </tr>
          ))}
        </BranchManageTableShell>
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
