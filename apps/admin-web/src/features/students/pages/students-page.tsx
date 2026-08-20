"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Pagination } from "@/src/shared/components/ui/pagination";
import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { useStudents } from "@/src/features/students/hooks/useStudents";
import { useActivateStudent } from "@/src/features/students/hooks/useActivateStudent";
import { useDeactivateStudent } from "@/src/features/students/hooks/useDeactivateStudent";
import { studentService } from "@/src/features/students/services/student.service";
import { DEFAULT_STUDENT_FILTERS } from "@/src/features/students/constants/student.constants";

import { StudentFiltersPanel } from "@/src/features/students/components/student-filters";
import { StudentTable } from "@/src/features/students/components/student-table";
import {
  StudentBulkActionsToolbar,
  type BulkStudentAction,
} from "@/src/features/students/components/student-bulk-actions-toolbar";
import { CreateStudentModal } from "@/src/features/students/components/create-student-modal";

import type {
  BranchOption,
  StudentListItem,
} from "@/src/features/students/types/student.types";
import {
  formatBulkResultToast,
  getEligibleActivateIds,
  getEligibleDeactivateIds,
  getEligibleDeleteIds,
  getEligiblePermanentDeleteIds,
  getEligibleRestoreIds,
} from "@/src/features/students/utils/student-bulk.utils";

export function StudentsPage() {
  const router = useRouter();

  const {
    students,
    total,
    filters,
    setFilters,
    isInitialLoading,
    isFetching,
    error,
    refetch,
  } = useStudents();

  const { activateStudent, isLoading: isActivating } = useActivateStudent();
  const { deactivateStudent, isLoading: isDeactivating } = useDeactivateStudent();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [bulkConfirmAction, setBulkConfirmAction] =
    useState<BulkStudentAction | null>(null);
  const [statusTarget, setStatusTarget] = useState<{
    student: StudentListItem;
    action: "activate" | "deactivate";
  } | null>(null);
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [branches, setBranches] = useState<BranchOption[]>([]);

  const pageSize = filters.pageSize ?? 20;
  const page = filters.page ?? 1;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const branchMap = useMemo(
    () =>
      Object.fromEntries(
        branches.map((branch) => [branch.id, branch.branchName]),
      ),
    [branches],
  );

  const hasActiveFilters = Boolean(
    (filters.search ?? "").trim() ||
      filters.branchId ||
      filters.status ||
      filters.includeDeleted,
  );

  const actionLoading =
    isActivating || isDeactivating || isBulkLoading;

  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const branchItems = await studentService.getBranches();
        setBranches(branchItems);
      } catch {
        // Filter dropdowns are optional; list still works without them.
      }
    };

    void loadFilterOptions();
  }, []);

  useEffect(() => {
    setSelectedStudentIds([]);
  }, [
    filters.page,
    filters.pageSize,
    filters.status,
    filters.includeDeleted,
    filters.search,
    filters.branchId,
  ]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(total / pageSize));
    if (page > maxPage) {
      setFilters({ ...filters, page: maxPage });
    }
  }, [total, page, pageSize, filters, setFilters]);

  const eligibleBulkIds = useMemo(() => {
    if (!bulkConfirmAction) {
      return [];
    }

    switch (bulkConfirmAction) {
      case "activate":
        return getEligibleActivateIds(students, selectedStudentIds);
      case "deactivate":
        return getEligibleDeactivateIds(students, selectedStudentIds);
      case "delete":
        return getEligibleDeleteIds(students, selectedStudentIds);
      case "restore":
        return getEligibleRestoreIds(students, selectedStudentIds);
      case "permanent-delete":
        return getEligiblePermanentDeleteIds(students, selectedStudentIds);
      default:
        return [];
    }
  }, [bulkConfirmAction, students, selectedStudentIds]);

  const handleBulkConfirm = async () => {
    if (!bulkConfirmAction || eligibleBulkIds.length === 0) {
      setBulkConfirmAction(null);
      return;
    }

    try {
      setIsBulkLoading(true);
      let result = null;

      switch (bulkConfirmAction) {
        case "activate":
          result = await studentService.bulkActivate(eligibleBulkIds);
          appToast.success(
            formatBulkResultToast(
              result.data,
              "student(s) activated successfully",
            ),
          );
          break;
        case "deactivate":
          result = await studentService.bulkDeactivate(eligibleBulkIds);
          appToast.success(
            formatBulkResultToast(
              result.data,
              "student(s) deactivated successfully",
            ),
          );
          break;
        case "delete":
          result = await studentService.bulkDelete(eligibleBulkIds);
          appToast.success(
            formatBulkResultToast(
              result.data,
              "student(s) archived successfully",
            ),
          );
          break;
        case "restore":
          result = await studentService.bulkRestore(eligibleBulkIds);
          appToast.success(
            formatBulkResultToast(
              result.data,
              "student(s) restored successfully",
            ),
          );
          break;
        case "permanent-delete":
          result = await studentService.bulkPermanentDelete(eligibleBulkIds);
          appToast.success(
            formatBulkResultToast(
              result.data,
              "student(s) permanently deleted",
            ),
          );
          break;
      }

      setSelectedStudentIds([]);
      setBulkConfirmAction(null);
      await refetch();
    } catch (err) {
      appToast.error(getErrorMessage(err));
    } finally {
      setIsBulkLoading(false);
    }
  };

  const bulkDialogCopy = useMemo(() => {
    const count = eligibleBulkIds.length;

    switch (bulkConfirmAction) {
      case "activate":
        return {
          title: "Activate selected students?",
          description: `Activate ${count} selected student${count === 1 ? "" : "s"}?`,
          confirmLabel: "Activate",
        };
      case "deactivate":
        return {
          title: "Deactivate selected students?",
          description: `Deactivate ${count} selected student${count === 1 ? "" : "s"}?`,
          confirmLabel: "Deactivate",
        };
      case "delete":
        return {
          title: "Archive selected students?",
          description: `Archive ${count} selected student${count === 1 ? "" : "s"}? They can be restored later.`,
          confirmLabel: "Archive",
        };
      case "restore":
        return {
          title: "Restore selected students?",
          description: `Restore ${count} archived student${count === 1 ? "" : "s"}?`,
          confirmLabel: "Restore",
        };
      case "permanent-delete":
        return {
          title: "Permanently delete selected students?",
          description: `You are about to permanently delete ${count} student${count === 1 ? "" : "s"}. This action cannot be undone.`,
          confirmLabel: "Permanently Delete",
        };
      default:
        return { title: "", description: "", confirmLabel: "Confirm" };
    }
  }, [bulkConfirmAction, eligibleBulkIds.length]);

  if (error && students.length === 0 && !isInitialLoading) {
    return (
      <ErrorState
        title="Failed To Load Students"
        description={error}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <>
      {error && students.length > 0 ? (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      ) : null}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Students</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Manage student profiles and admissions
          </p>
        </div>
        <Button type="button" onClick={() => setIsCreateOpen(true)}>
          + Create Student
        </Button>
      </div>

      <StudentFiltersPanel
        filters={filters}
        branches={branches}
        onChange={setFilters}
        onReset={() =>
          setFilters({
            ...DEFAULT_STUDENT_FILTERS,
            page: 1,
            pageSize,
          })
        }
      />

      <StudentBulkActionsToolbar
        students={students}
        selectedStudentIds={selectedStudentIds}
        disabled={actionLoading}
        onAction={setBulkConfirmAction}
      />

      <Card className="mt-4 overflow-hidden">
        {isInitialLoading ? (
          <div className="p-4">
            <SkeletonTable />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <StudentTable
              students={students}
              branchMap={branchMap}
              selectedStudentIds={selectedStudentIds}
              onSelectionChange={setSelectedStudentIds}
              actionsDisabled={actionLoading}
              emptyTitle={
                hasActiveFilters
                  ? "No students match your current filters"
                  : "No Students Found"
              }
              emptyDescription={
                hasActiveFilters
                  ? "Try adjusting your search or filter criteria."
                  : "Create your first student to get started."
              }
              onManage={(student) =>
                router.push(`/students/${student.id}/manage`)
              }
              onActivate={(student) =>
                setStatusTarget({ student, action: "activate" })
              }
              onDeactivate={(student) =>
                setStatusTarget({ student, action: "deactivate" })
              }
            />
          </div>
        )}

        {isFetching && !isInitialLoading ? (
          <p className="border-t border-slate-100 px-4 py-2 text-xs text-slate-500">
            Updating students...
          </p>
        ) : null}
      </Card>

      <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-3 sm:flex-row sm:items-center sm:justify-between">
        {total > 0 ? (
          <>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
              <span>
                Showing {from}–{to} of {total}
              </span>
              <label className="flex items-center gap-2">
                <span className="whitespace-nowrap">Rows per page</span>
                <select
                  className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-sm"
                  value={pageSize}
                  disabled={actionLoading}
                  onChange={(event) =>
                    setFilters({
                      ...filters,
                      pageSize: Number(event.target.value),
                      page: 1,
                    })
                  }
                >
                  {[10, 20, 50].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={(nextPage) =>
                setFilters({ ...filters, page: nextPage })
              }
            />
          </>
        ) : (
          <p className="text-sm text-slate-600">Showing 0 students</p>
        )}
      </div>

      <CreateStudentModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={async () => {
          await refetch();
        }}
      />

      <ConfirmDialog
        open={Boolean(statusTarget)}
        title={
          statusTarget?.action === "activate"
            ? "Activate student?"
            : "Deactivate student?"
        }
        description={
          statusTarget
            ? `${statusTarget.action === "activate" ? "Activate" : "Deactivate"} "${[statusTarget.student.firstName, statusTarget.student.lastName].filter(Boolean).join(" ")}"?`
            : ""
        }
        confirmLabel={
          statusTarget?.action === "activate" ? "Activate" : "Deactivate"
        }
        loading={isActivating || isDeactivating}
        onCancel={() => setStatusTarget(null)}
        onConfirm={async () => {
          if (!statusTarget) {
            return;
          }

          try {
            if (statusTarget.action === "activate") {
              await activateStudent(statusTarget.student.id);
              appToast.success("Student activated successfully");
            } else {
              await deactivateStudent(statusTarget.student.id);
              appToast.success("Student deactivated successfully");
            }

            setStatusTarget(null);
            await refetch();
          } catch (err) {
            appToast.error(getErrorMessage(err));
          }
        }}
      />

      <ConfirmDialog
        open={bulkConfirmAction !== null}
        title={bulkDialogCopy.title}
        description={bulkDialogCopy.description}
        confirmLabel={bulkDialogCopy.confirmLabel}
        loading={isBulkLoading}
        onCancel={() => setBulkConfirmAction(null)}
        onConfirm={() => {
          void handleBulkConfirm();
        }}
      />
    </>
  );
}
