"use client";

import { useCallback, useEffect, useState } from "react";
import { Eye, Link2Off } from "lucide-react";

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
import {
  assignBatchToBranch,
  unassignBatchFromBranch,
} from "@/src/features/branches/utils/branch-assign.utils";
import { formatTrainerNames } from "@/src/features/branches/utils/branch-display.utils";
import { batchService } from "@/src/features/batches/services/batch.service";
import { BatchStatusBadge } from "@/src/features/batches/components/BatchStatusBadge";
import type { Batch } from "@/src/features/batches/types/batch.types";
import { courseService } from "@/src/features/courses/services/course.service";
import { formatStudentDate } from "@/src/features/students/utils/student-form.utils";

interface Props {
  branchId: string;
  assignmentsDisabled?: boolean;
  onSummaryRefresh?: () => Promise<void>;
}

export function BranchManageBatchesPanel({
  branchId,
  assignmentsDisabled = false,
  onSummaryRefresh,
}: Props) {
  const [search, setSearch] = useState("");
  const [batches, setBatches] = useState<Batch[]>([]);
  const [categoryByCourseId, setCategoryByCourseId] = useState<
    Record<string, string>
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
      const [batchResponse, courseResponse] = await Promise.all([
        batchService.getBatches({
          search,
          branchId,
          includeDeleted: false,
          page: 1,
          pageSize: 100,
        }),
        courseService.getCourses({
          branchId,
          page: 1,
          pageSize: 200,
        }),
      ]);

      setBatches(batchResponse.data.items ?? []);

      const categoryMap: Record<string, string> = {};
      for (const course of courseResponse.data.items ?? []) {
        if (course.category?.name || course.categoryName) {
          categoryMap[course.id] =
            course.category?.name ?? course.categoryName ?? "";
        }
      }
      setCategoryByCourseId(categoryMap);
    } catch (error) {
      appToast.error(getErrorMessage(error));
      setBatches([]);
      setCategoryByCourseId({});
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

        <BranchManageTableShell
          columns={[
            { key: "code", label: "Batch Code" },
            { key: "name", label: "Batch Name" },
            { key: "course", label: "Course" },
            { key: "category", label: "Category" },
            { key: "trainers", label: "Trainer(s)" },
            { key: "start", label: "Start Date", className: "w-[7rem]" },
            { key: "end", label: "End Date", className: "w-[7rem]" },
            { key: "status", label: "Status", className: "w-[8rem]" },
            {
              key: "actions",
              label: "Actions",
              className: "w-[5.5rem] text-right",
            },
          ]}
          isLoading={isLoading}
          isEmpty={!isLoading && batches.length === 0}
          emptyMessage="No batches assigned yet"
          emptyDescription="Assign batches to this branch to get started."
        >
          {batches.map((batch) => (
            <tr key={batch.id} className="hover:bg-slate-50">
              <td className="truncate px-4 py-3 font-mono text-sm text-slate-700">
                {batch.code ?? ""}
              </td>
              <td className="truncate px-4 py-3 text-sm font-medium text-slate-900">
                {batch.name}
              </td>
              <td className="truncate px-4 py-3 text-sm text-slate-700">
                {batch.course?.title ?? ""}
              </td>
              <td className="truncate px-4 py-3 text-sm text-slate-700">
                {batch.courseId
                  ? (categoryByCourseId[batch.courseId] ?? "")
                  : ""}
              </td>
              <td className="truncate px-4 py-3 text-sm text-slate-700">
                {batch.trainers?.length
                  ? formatTrainerNames(batch.trainers)
                  : ""}
              </td>
              <td className="px-4 py-3 text-sm text-slate-700">
                {formatStudentDate(batch.startDate)}
              </td>
              <td className="px-4 py-3 text-sm text-slate-700">
                {formatStudentDate(batch.endDate)}
              </td>
              <td className="px-4 py-3">
                <BatchStatusBadge status={batch.status} />
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-1">
                  <BranchIconAction
                    icon={Eye}
                    label="View"
                    href={`/batches/${batch.id}/manage`}
                  />
                  <BranchIconAction
                    icon={Link2Off}
                    label="Unassign batch"
                    destructive
                    disabled={assignmentsDisabled}
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
