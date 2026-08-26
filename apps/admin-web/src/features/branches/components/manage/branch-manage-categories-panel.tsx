"use client";

import { useCallback, useEffect, useState } from "react";
import { Link2Off } from "lucide-react";

import { Card } from "@/src/shared/components/ui/card";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { Badge } from "@/src/shared/components/ui/badge";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { branchService } from "@/src/features/branches/services/branch.service";
import {
  AssignEntitiesModal,
  type AssignableItem,
} from "@/src/features/branches/components/manage/assign-entities-modal";
import { BranchIconAction } from "@/src/features/branches/components/manage/branch-icon-action";
import { BranchManageTableShell } from "@/src/features/branches/components/manage/branch-manage-table-shell";
import { BranchSectionToolbar } from "@/src/features/branches/components/manage/branch-section-toolbar";
import { categoryService } from "@/src/features/categories/services/category.service";
import type { CategoryListItem } from "@/src/features/categories/types/category.types";

interface Props {
  branchId: string;
  assignmentsDisabled?: boolean;
  assignOnMount?: boolean;
  onAssignOnMountHandled?: () => void;
  onSummaryRefresh?: () => Promise<void>;
}

export function BranchManageCategoriesPanel({
  branchId,
  assignmentsDisabled = false,
  assignOnMount = false,
  onAssignOnMountHandled,
  onSummaryRefresh,
}: Props) {
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<CategoryListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignSearch, setAssignSearch] = useState("");
  const [assignCandidates, setAssignCandidates] = useState<AssignableItem[]>([]);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignSubmitting, setAssignSubmitting] = useState(false);

  const [unassignTarget, setUnassignTarget] = useState<{
    id: string;
    label: string;
  } | null>(null);
  const [unassignLoading, setUnassignLoading] = useState(false);

  const loadData = useCallback(async () => {
    if (!branchId) {
      setCategories([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const categoryResponse = await categoryService.getCategories({
        search,
        branchId,
        page: 1,
        pageSize: 100,
      });

      setCategories(
        (categoryResponse.data ?? []).filter((item) => !item.isDeleted),
      );
    } catch (error) {
      appToast.error(getErrorMessage(error));
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, [branchId, search]);

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
        categoryService.getCategories({
          search: "",
          branchId,
          page: 1,
          pageSize: 100,
        }),
        categoryService.getCategories({
          search: "",
          status: "ACTIVE",
          page: 1,
          pageSize: 100,
        }),
      ]);
      const assignedIds = new Set(
        (assignedResponse.data ?? [])
          .filter((item) => !item.isDeleted)
          .map((item) => item.id),
      );
      setAssignCandidates(
        (availableResponse.data ?? [])
          .filter(
            (item) =>
              !item.isDeleted &&
              item.status === "ACTIVE" &&
              !assignedIds.has(item.id),
          )
          .map((item) => ({
            id: item.id,
            label: item.name,
            meta: item.status,
            imageUrl: item.thumbnailUrl,
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
      await branchService.assignCategories(branchId, ids);
      appToast.success(
        ids.length === 1
          ? "Category assigned successfully"
          : `${ids.length} categories assigned successfully`,
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
    if (!unassignTarget || !branchId) {
      return;
    }

    setUnassignLoading(true);
    try {
      await branchService.unassignCategory(branchId, unassignTarget.id);
      appToast.success("Category unassigned");
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
          searchPlaceholder="Search categories..."
          assignLabel="Assign Category"
          onAssign={() => {
            void openAssign();
          }}
          assignDisabled={assignmentsDisabled}
        />

        <BranchManageTableShell
          columns={[
            { key: "category", label: "Category" },
            { key: "status", label: "Status", className: "w-[8rem]" },
            {
              key: "actions",
              label: "Actions",
              className: "w-[4.5rem] text-right",
            },
          ]}
          isLoading={isLoading}
          isEmpty={!isLoading && categories.length === 0}
          emptyMessage="No categories assigned yet"
          emptyDescription="Assign categories to this branch to get started."
        >
          {categories.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50">
              <td className="truncate px-4 py-3 text-sm font-medium text-slate-900">
                {item.name}
              </td>
              <td className="px-4 py-3">
                <Badge variant="success" className="px-2.5 py-0.5 text-sm">
                  Assigned
                </Badge>
              </td>
              <td className="px-4 py-3 text-right">
                <BranchIconAction
                  icon={Link2Off}
                  label="Unassign"
                  destructive
                  disabled={assignmentsDisabled || unassignLoading}
                  onClick={() =>
                    setUnassignTarget({
                      id: item.id,
                      label: item.name,
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
        title="Assign Categories"
        items={assignCandidates}
        isLoading={assignLoading}
        isSubmitting={assignSubmitting}
        search={assignSearch}
        onSearchChange={setAssignSearch}
        searchPlaceholder="Search categories..."
        emptyMessage="No active categories available to assign"
        onClose={() => setAssignOpen(false)}
        onAssign={handleAssign}
      />

      <ConfirmDialog
        open={Boolean(unassignTarget)}
        title="Unassign category?"
        description={`Remove "${unassignTarget?.label ?? "this category"}" from this branch? The category itself will not be deleted.`}
        confirmLabel="Unassign"
        loading={unassignLoading}
        onCancel={() => setUnassignTarget(null)}
        onConfirm={() => {
          void handleUnassign();
        }}
      />
    </>
  );
}
