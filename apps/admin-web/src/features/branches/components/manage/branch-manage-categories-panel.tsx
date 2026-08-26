"use client";

import { useCallback, useEffect, useState } from "react";
import { Link2Off } from "lucide-react";

import { Card } from "@/src/shared/components/ui/card";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { branchService } from "@/src/features/branches/services/branch.service";
import {
  AssignEntitiesModal,
  type AssignableItem,
} from "@/src/features/branches/components/manage/assign-entities-modal";
import { BranchIconAction } from "@/src/features/branches/components/manage/branch-icon-action";
import { BranchManageCardGrid } from "@/src/features/branches/components/manage/branch-manage-card-grid";
import { BranchSectionToolbar } from "@/src/features/branches/components/manage/branch-section-toolbar";
import { BranchSummaryModuleCard } from "@/src/features/branches/components/manage/branch-summary-module-card";
import { categoryService } from "@/src/features/categories/services/category.service";
import { CategoryStatusBadge } from "@/src/features/categories/components/category-status-badge";
import type { CategoryListItem } from "@/src/features/categories/types/category.types";
import { courseService } from "@/src/features/courses/services/course.service";

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
  const [courseCountByCategory, setCourseCountByCategory] = useState<
    Record<string, number>
  >({});
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
    setIsLoading(true);
    try {
      const [categoryResponse, courseResponse] = await Promise.all([
        categoryService.getCategories({
          search,
          status: "ACTIVE",
          branchId,
          page: 1,
          pageSize: 100,
        }),
        courseService.getCourses({
          branchId,
          page: 1,
          pageSize: 100,
        }),
      ]);

      const items = (categoryResponse.data ?? []).filter(
        (item) => !item.isDeleted && item.status === "ACTIVE",
      );
      setCategories(items);

      const counts: Record<string, number> = {};
      for (const course of courseResponse.data.items ?? []) {
        if (course.categoryId) {
          counts[course.categoryId] = (counts[course.categoryId] ?? 0) + 1;
        }
      }
      setCourseCountByCategory(counts);
    } catch (error) {
      appToast.error(getErrorMessage(error));
      setCategories([]);
      setCourseCountByCategory({});
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
      const response = await categoryService.getCategories({
        search: "",
        status: "ACTIVE",
        page: 1,
        pageSize: 100,
      });
      const assignedIds = new Set(categories.map((item) => item.id));
      setAssignCandidates(
        (response.data ?? [])
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
    if (ids.length === 0) {
      return;
    }

    setAssignSubmitting(true);
    try {
      await branchService.assignCategories(branchId, ids);
      appToast.success("Categories assigned");
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
          assignLabel="Assign Categories"
          onAssign={() => {
            void openAssign();
          }}
          assignDisabled={assignmentsDisabled}
        />

        <BranchManageCardGrid
          isLoading={isLoading}
          isEmpty={!isLoading && categories.length === 0}
          emptyMessage="No Categories Yet"
          emptyDescription="Assign categories to this branch to get started."
        >
          {categories.map((item) => (
            <BranchSummaryModuleCard
              key={item.id}
              title={item.name}
              subtitle={item.description?.trim() || undefined}
              imageUrl={item.thumbnailUrl}
              imageAlt={item.name}
              assignedCount={courseCountByCategory[item.id] ?? 0}
              assignedLabel={
                (courseCountByCategory[item.id] ?? 0) === 1
                  ? "course"
                  : "courses"
              }
              badge={<CategoryStatusBadge status={item.status} />}
              footer={
                <BranchIconAction
                  icon={Link2Off}
                  label="Unassign Category"
                  destructive
                  disabled={assignmentsDisabled}
                  onClick={() =>
                    setUnassignTarget({
                      id: item.id,
                      label: item.name,
                    })
                  }
                />
              }
            />
          ))}
        </BranchManageCardGrid>
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
        title="Unassign Category"
        description={`Remove "${unassignTarget?.label ?? "this category"}" from this branch? The category itself will not be deleted.`}
        confirmLabel="Unassign"
        loading={unassignLoading}
        onCancel={() => setUnassignTarget(null)}
        onConfirm={handleUnassign}
      />
    </>
  );
}
