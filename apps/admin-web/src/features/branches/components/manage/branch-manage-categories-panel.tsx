"use client";

import { useCallback, useEffect, useState } from "react";
import { Link2Off, Tag } from "lucide-react";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { branchService } from "@/src/features/branches/services/branch.service";
import {
  AssignEntitiesModal,
  type AssignableItem,
} from "@/src/features/branches/components/manage/assign-entities-modal";
import { BranchIconAction } from "@/src/features/branches/components/manage/branch-icon-action";
import {
  TABLE_CELL_CLASS,
  BranchManageTableShell,
} from "@/src/features/branches/components/manage/branch-manage-table-shell";
import { BranchSectionToolbar } from "@/src/features/branches/components/manage/branch-section-toolbar";
import {
  BRANCH_TAB_COUNT_CLASS,
  BRANCH_TAB_HEADER_CLASS,
  BRANCH_TAB_HEADER_ROW_CLASS,
  BRANCH_TAB_TITLE_CLASS,
  BRANCH_TABLE_CARD_CLASS,
} from "@/src/features/branches/components/manage/branch-manage-layout.constants";
import { categoryService } from "@/src/features/categories/services/category.service";
import type { CategoryListItem } from "@/src/features/categories/types/category.types";
import { CategoryStatusBadge } from "@/src/features/categories/components/category-status-badge";

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
      <div className="space-y-3">
        <header className={BRANCH_TAB_HEADER_CLASS}>
          <div className={BRANCH_TAB_HEADER_ROW_CLASS}>
            <div className="flex shrink-0 flex-wrap items-baseline gap-x-3 gap-y-0.5">
              <h2 className={BRANCH_TAB_TITLE_CLASS}>Categories</h2>
              <span className={BRANCH_TAB_COUNT_CLASS}>
                Total Categories:
                <span className="ml-1 font-semibold tabular-nums text-[#647A9B]">
                  {isLoading ? "—" : categories.length}
                </span>
              </span>
            </div>

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
          </div>
        </header>

        <div className={BRANCH_TABLE_CARD_CLASS}>
          <BranchManageTableShell
            embedded
            columns={[
              { key: "category", label: "Category" },
              { key: "status", label: "Status", className: "w-[8rem]" },
              {
                key: "actions",
                label: "Actions",
                className: "w-[6.75rem] text-right",
              },
            ]}
            isLoading={isLoading}
            isEmpty={!isLoading && categories.length === 0}
            emptyTitle="No Categories Assigned Yet"
            emptyDescription="Assign categories to this branch to get started."
            emptyIcon={Tag}
          >
            {categories.map((item) => (
              <tr
                key={item.id}
                className="border-b border-slate-100 bg-white transition-colors hover:bg-slate-50"
              >
                <td className={`${TABLE_CELL_CLASS} font-medium text-[#102A56]`}>
                  <span className="block truncate" title={item.name}>
                    {item.name}
                  </span>
                </td>
                <td className={TABLE_CELL_CLASS}>
                  <CategoryStatusBadge status={item.status} />
                </td>
                <td className={TABLE_CELL_CLASS}>
                  <div className="flex items-center justify-end gap-2">
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
                  </div>
                </td>
              </tr>
            ))}
          </BranchManageTableShell>
        </div>
      </div>

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
