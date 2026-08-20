"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Pagination } from "@/src/shared/components/ui/pagination";
import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { enrollmentService } from "@/src/features/enrollments/services/enrollment.service";
import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";
import { useStudentEnrollments } from "@/src/features/students/hooks/useStudentEnrollments";
import { studentService } from "@/src/features/students/services/student.service";
import type { BranchOption, Student } from "@/src/features/students/types/student.types";

import { CreateStudentEnrollmentModal } from "./create-student-enrollment-modal";
import { UpdateStudentEnrollmentModal } from "./update-student-enrollment-modal";
import { StudentEnrollmentTable } from "./student-enrollment-table";

interface Props {
  student: Student;
}

export function StudentManageEnrollmentsPanel({ student }: Props) {
  const {
    enrollments,
    total,
    isLoading,
    error,
    page,
    pageSize,
    includeDeleted,
    setPage,
    setIncludeDeleted,
    refetch,
  } = useStudentEnrollments({ studentId: student.id });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Enrollment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Enrollment | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<Enrollment | null>(null);
  const [permanentDeleteTarget, setPermanentDeleteTarget] =
    useState<Enrollment | null>(null);
  const [statusTarget, setStatusTarget] = useState<{
    enrollment: Enrollment;
    activate: boolean;
  } | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [branches, setBranches] = useState<BranchOption[]>([]);

  const branchMap = useMemo(
    () =>
      Object.fromEntries(
        branches.map((branch) => [branch.id, branch.branchName]),
      ),
    [branches],
  );

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const actionDisabled = isActionLoading;

  useEffect(() => {
    const loadBranches = async () => {
      try {
        const branchItems = await studentService.getBranches();
        setBranches(branchItems);
      } catch {
        // Branch names are optional for display.
      }
    };

    void loadBranches();
  }, []);

  const loadEnrollmentDetail = async (id: string) => {
    const response = await enrollmentService.getEnrollment(id);
    return response.data;
  };

  const handleEdit = async (enrollment: Enrollment) => {
    try {
      const detail = await loadEnrollmentDetail(enrollment.id);
      setEditTarget(detail);
    } catch (err) {
      appToast.error(getErrorMessage(err));
    }
  };

  const handleActivateDeactivate = async () => {
    if (!statusTarget) {
      return;
    }

    try {
      setIsActionLoading(true);
      await enrollmentService.updateEnrollment(statusTarget.enrollment.id, {
        isActive: statusTarget.activate,
      });
      appToast.success(
        statusTarget.activate
          ? "Enrollment activated successfully"
          : "Enrollment deactivated successfully",
      );
      setStatusTarget(null);
      await refetch();
    } catch (err) {
      appToast.error(getErrorMessage(err));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      setIsActionLoading(true);
      await enrollmentService.deleteEnrollment(deleteTarget.id);
      appToast.success("Enrollment deleted successfully");
      setDeleteTarget(null);
      await refetch();
    } catch (err) {
      appToast.error(getErrorMessage(err));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!restoreTarget) {
      return;
    }

    try {
      setIsActionLoading(true);
      await enrollmentService.restoreEnrollment(restoreTarget.id);
      appToast.success("Enrollment restored successfully");
      setRestoreTarget(null);
      await refetch();
    } catch (err) {
      appToast.error(getErrorMessage(err));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handlePermanentDelete = async () => {
    if (!permanentDeleteTarget) {
      return;
    }

    try {
      setIsActionLoading(true);
      await enrollmentService.permanentDeleteEnrollment(permanentDeleteTarget.id);
      appToast.success("Enrollment permanently deleted");
      setPermanentDeleteTarget(null);
      await refetch();
    } catch (err) {
      appToast.error(getErrorMessage(err));
    } finally {
      setIsActionLoading(false);
    }
  };

  const statusDialogCopy = useMemo(() => {
    if (!statusTarget) {
      return { title: "", description: "" };
    }

    const batchName = statusTarget.enrollment.batch?.name ?? "this batch";

    return statusTarget.activate
      ? {
          title: "Activate enrollment?",
          description: `Activate enrollment for ${batchName}?`,
        }
      : {
          title: "Deactivate enrollment?",
          description: `Deactivate enrollment for ${batchName}? This only changes the active status and does not delete the enrollment.`,
        };
  }, [statusTarget]);

  if (error && enrollments.length === 0 && !isLoading) {
    return (
      <ErrorState
        title="Failed to load enrollments"
        description={error}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Enrollments</h2>
          <p className="text-sm text-slate-500">
            Manage batch enrollments for this student
          </p>
        </div>
        <Button type="button" onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          Create Enrollment
        </Button>
      </div>

      <div className="mb-3 flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={includeDeleted}
            onChange={(event) => setIncludeDeleted(event.target.checked)}
          />
          Show archived enrollments
        </label>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-4">
            <SkeletonTable />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <StudentEnrollmentTable
              student={student}
              enrollments={enrollments}
              branchMap={branchMap}
              disabled={actionDisabled}
              onManageEdit={(enrollment) => {
                void handleEdit(enrollment);
              }}
              onManageDelete={setDeleteTarget}
              onManageRestore={setRestoreTarget}
              onManagePermanentDelete={setPermanentDeleteTarget}
              onActivate={(enrollment) =>
                setStatusTarget({ enrollment, activate: true })
              }
              onDeactivate={(enrollment) =>
                setStatusTarget({ enrollment, activate: false })
              }
            />
          </div>
        )}
      </Card>

      {total > 0 ? (
        <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">
            Showing {from}–{to} of {total}
          </p>
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      ) : null}

      <CreateStudentEnrollmentModal
        open={isCreateOpen}
        student={student}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={refetch}
      />

      {editTarget ? (
        <UpdateStudentEnrollmentModal
          open={Boolean(editTarget)}
          student={student}
          enrollment={editTarget}
          branchMap={branchMap}
          onClose={() => setEditTarget(null)}
          onSuccess={refetch}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(statusTarget)}
        title={statusDialogCopy.title}
        description={statusDialogCopy.description}
        confirmLabel={statusTarget?.activate ? "Activate" : "Deactivate"}
        loading={isActionLoading}
        onCancel={() => setStatusTarget(null)}
        onConfirm={() => {
          void handleActivateDeactivate();
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete enrollment?"
        description="This enrollment will be archived and can be restored later."
        confirmLabel="Delete"
        loading={isActionLoading}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          void handleDelete();
        }}
      />

      <ConfirmDialog
        open={Boolean(restoreTarget)}
        title="Restore enrollment?"
        description="Restore this archived enrollment?"
        confirmLabel="Restore"
        loading={isActionLoading}
        onCancel={() => setRestoreTarget(null)}
        onConfirm={() => {
          void handleRestore();
        }}
      />

      <ConfirmDialog
        open={Boolean(permanentDeleteTarget)}
        title="Permanently delete enrollment?"
        description="This action cannot be undone."
        confirmLabel="Permanently Delete"
        loading={isActionLoading}
        onCancel={() => setPermanentDeleteTarget(null)}
        onConfirm={() => {
          void handlePermanentDelete();
        }}
      />
    </>
  );
}
