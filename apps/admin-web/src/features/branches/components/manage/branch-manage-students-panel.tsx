"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Card } from "@/src/shared/components/ui/card";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { Pagination } from "@/src/shared/components/ui/pagination";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import {
  AssignEntitiesModal,
  type AssignableItem,
} from "@/src/features/branches/components/manage/assign-entities-modal";
import { BranchManageTableShell } from "@/src/features/branches/components/manage/branch-manage-table-shell";
import { BranchSectionToolbar } from "@/src/features/branches/components/manage/branch-section-toolbar";
import { assignStudentToBranch } from "@/src/features/branches/utils/branch-assign.utils";
import { formatPersonName } from "@/src/features/branches/utils/branch-display.utils";
import { enrollmentService } from "@/src/features/enrollments/services/enrollment.service";
import { useActivateStudent } from "@/src/features/students/hooks/useActivateStudent";
import { useDeactivateStudent } from "@/src/features/students/hooks/useDeactivateStudent";
import { useDeleteStudent } from "@/src/features/students/hooks/useDeleteStudent";
import { usePermanentDeleteStudent } from "@/src/features/students/hooks/usePermanentDeleteStudent";
import { useRestoreStudent } from "@/src/features/students/hooks/useRestoreStudent";
import { UpdateStudentModal } from "@/src/features/students/components/update-student-modal";
import { StudentRowActionsMenu } from "@/src/features/students/components/student-row-actions-menu";
import { studentService } from "@/src/features/students/services/student.service";
import type { StudentListItem } from "@/src/features/students/types/student.types";
import { parseStudentListResponse } from "@/src/features/students/utils/student-list.utils";
import { formatStudentDate } from "@/src/features/students/utils/student-form.utils";
import { StudentStatusBadge } from "@/src/features/students/components/StudentStatusBadge";
import { isArchivedStudent } from "@/src/features/students/utils/student-bulk.utils";
import { studentManagePath } from "@/src/features/students/utils/student-manage.routes";
import { parseEnrollmentListResponse } from "@/src/features/enrollments/utils/enrollment-list.utils";

const PAGE_SIZE = 10;

interface Props {
  branchId: string;
  assignmentsDisabled?: boolean;
  onSummaryRefresh?: () => Promise<void>;
}

export function BranchManageStudentsPanel({
  branchId,
  assignmentsDisabled = false,
  onSummaryRefresh,
}: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [enrollmentCountByStudent, setEnrollmentCountByStudent] = useState<
    Record<string, number>
  >({});
  const [isLoading, setIsLoading] = useState(true);

  const [editTarget, setEditTarget] = useState<StudentListItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StudentListItem | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<StudentListItem | null>(null);
  const [permanentDeleteTarget, setPermanentDeleteTarget] =
    useState<StudentListItem | null>(null);
  const [statusTarget, setStatusTarget] = useState<{
    student: StudentListItem;
    action: "activate" | "deactivate";
  } | null>(null);

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignSearch, setAssignSearch] = useState("");
  const [assignCandidates, setAssignCandidates] = useState<AssignableItem[]>(
    [],
  );
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignSubmitting, setAssignSubmitting] = useState(false);

  const { activateStudent, isLoading: isActivating } = useActivateStudent();
  const { deactivateStudent, isLoading: isDeactivating } = useDeactivateStudent();
  const { deleteStudent, isPending: isDeleting } = useDeleteStudent();
  const { restoreStudent, isPending: isRestoring } = useRestoreStudent();
  const { permanentDeleteStudent, isPending: isPermanentlyDeleting } =
    usePermanentDeleteStudent();

  const actionLoading =
    isActivating ||
    isDeactivating ||
    isDeleting ||
    isRestoring ||
    isPermanentlyDeleting;

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [studentResponse, enrollmentResponse] = await Promise.all([
        studentService.getStudents({
          search,
          includeDeleted: false,
          branchId,
          page,
          pageSize: PAGE_SIZE,
        }),
        enrollmentService.getEnrollments({
          branchId,
          skip: 0,
          take: 500,
        }),
      ]);

      const payload = parseStudentListResponse(studentResponse.data);
      setStudents(payload.items);
      setTotal(payload.count);

      const enrollmentPayload = parseEnrollmentListResponse(enrollmentResponse);
      const counts: Record<string, number> = {};
      for (const enrollment of enrollmentPayload.items) {
        const studentId = enrollment.student?.id;
        if (studentId) {
          counts[studentId] = (counts[studentId] ?? 0) + 1;
        }
      }
      setEnrollmentCountByStudent(counts);
    } catch (error) {
      appToast.error(getErrorMessage(error));
      setStudents([]);
      setTotal(0);
      setEnrollmentCountByStudent({});
    } finally {
      setIsLoading(false);
    }
  }, [branchId, page, search]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const openAssign = async () => {
    setAssignOpen(true);
    setAssignSearch("");
    setAssignLoading(true);
    try {
      const response = await studentService.getStudents({
        includeDeleted: false,
        onlyActive: true,
        page: 1,
        pageSize: 200,
      });
      const payload = parseStudentListResponse(response.data);
      setAssignCandidates(
        payload.items
          .filter(
            (item) =>
              item.isActive &&
              !isArchivedStudent(item) &&
              item.branchId !== branchId,
          )
          .map((item) => ({
            id: item.id,
            label: formatPersonName(item.firstName, item.lastName),
            meta: item.studentCode ?? item.email ?? undefined,
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
        await assignStudentToBranch(id, branchId);
      }
      appToast.success(
        ids.length === 1
          ? "Student assigned successfully"
          : `${ids.length} students assigned successfully`,
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

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleStatusChange = async () => {
    if (!statusTarget) {
      return;
    }

    try {
      if (statusTarget.action === "activate") {
        await activateStudent(statusTarget.student.id);
        appToast.success("Student activated");
      } else {
        await deactivateStudent(statusTarget.student.id);
        appToast.success("Student deactivated");
      }
      setStatusTarget(null);
      await loadData();
      await onSummaryRefresh?.();
    } catch (error) {
      appToast.error(getErrorMessage(error));
    }
  };

  return (
    <>
      <Card className="rounded-xl border border-slate-200 p-4 shadow-sm">
        <BranchSectionToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search students..."
          assignLabel="Assign Student"
          onAssign={() => {
            void openAssign();
          }}
          assignDisabled={assignmentsDisabled}
        />

        <BranchManageTableShell
          columns={[
            { key: "code", label: "Student Code" },
            { key: "name", label: "Student" },
            { key: "email", label: "Email" },
            { key: "phone", label: "Phone" },
            { key: "enrollments", label: "Enrollments", className: "w-[6rem]" },
            { key: "admission", label: "Admission Date", className: "w-[7rem]" },
            { key: "status", label: "Status", className: "w-[8rem]" },
            {
              key: "actions",
              label: "Actions",
              className: "w-[4.5rem] text-right",
            },
          ]}
          isLoading={isLoading}
          isEmpty={!isLoading && students.length === 0}
          emptyMessage="No students assigned yet"
          emptyDescription="Assign students to this branch to get started."
        >
          {students.map((student) => (
            <tr key={student.id} className="hover:bg-slate-50">
              <td className="truncate px-4 py-3 font-mono text-sm text-slate-700">
                {student.studentCode}
              </td>
              <td className="truncate px-4 py-3 text-sm font-medium text-slate-900">
                {formatPersonName(student.firstName, student.lastName)}
              </td>
              <td className="truncate px-4 py-3 text-sm text-slate-700">
                {student.email ?? ""}
              </td>
              <td className="truncate px-4 py-3 text-sm text-slate-700">
                {student.phone ?? ""}
              </td>
              <td className="px-4 py-3 text-sm text-slate-700">
                {enrollmentCountByStudent[student.id] ?? 0}
              </td>
              <td className="px-4 py-3 text-sm text-slate-700">
                {formatStudentDate(student.admissionDate)}
              </td>
              <td className="px-4 py-3">
                <StudentStatusBadge
                  status={student.status}
                  isActive={student.isActive}
                  isDeleted={isArchivedStudent(student)}
                />
              </td>
              <td className="px-4 py-3 text-right">
                <StudentRowActionsMenu
                  student={student}
                  disabled={assignmentsDisabled || actionLoading}
                  onManage={(item) =>
                    router.push(studentManagePath(item.id))
                  }
                  onEdit={setEditTarget}
                  onActivate={(item) =>
                    setStatusTarget({
                      student: item,
                      action: "activate",
                    })
                  }
                  onDeactivate={(item) =>
                    setStatusTarget({
                      student: item,
                      action: "deactivate",
                    })
                  }
                  onDelete={setDeleteTarget}
                  onRestore={setRestoreTarget}
                  onPermanentDelete={setPermanentDeleteTarget}
                />
              </td>
            </tr>
          ))}
        </BranchManageTableShell>

        {!isLoading && students.length > 0 ? (
          <div className="mt-4">
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        ) : null}
      </Card>

      <AssignEntitiesModal
        open={assignOpen}
        title="Assign Students"
        items={assignCandidates}
        isLoading={assignLoading}
        isSubmitting={assignSubmitting}
        search={assignSearch}
        onSearchChange={setAssignSearch}
        searchPlaceholder="Search students..."
        emptyMessage="No active students available to assign"
        onClose={() => setAssignOpen(false)}
        onAssign={handleAssign}
      />

      {editTarget ? (
        <UpdateStudentModal
          open
          student={editTarget}
          onClose={() => setEditTarget(null)}
          onSuccess={async () => {
            setEditTarget(null);
            await loadData();
            await onSummaryRefresh?.();
          }}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Student"
        description={`Archive "${deleteTarget ? formatPersonName(deleteTarget.firstName, deleteTarget.lastName) : "this student"}"?`}
        confirmLabel="Delete"
        loading={isDeleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) {
            return;
          }
          try {
            await deleteStudent(deleteTarget.id);
            appToast.success("Student archived");
            setDeleteTarget(null);
            await loadData();
            await onSummaryRefresh?.();
          } catch (error) {
            appToast.error(getErrorMessage(error));
          }
        }}
      />

      <ConfirmDialog
        open={Boolean(restoreTarget)}
        title="Restore Student"
        description="Restore this student?"
        confirmLabel="Restore"
        confirmVariant="primary"
        onCancel={() => setRestoreTarget(null)}
        onConfirm={async () => {
          if (!restoreTarget) {
            return;
          }
          try {
            await restoreStudent(restoreTarget.id);
            appToast.success("Student restored");
            setRestoreTarget(null);
            await loadData();
            await onSummaryRefresh?.();
          } catch (error) {
            appToast.error(getErrorMessage(error));
          }
        }}
      />

      <ConfirmDialog
        open={Boolean(permanentDeleteTarget)}
        title="Permanent Delete"
        description="This action cannot be undone."
        confirmLabel="Delete Permanently"
        loading={isPermanentlyDeleting}
        onCancel={() => setPermanentDeleteTarget(null)}
        onConfirm={async () => {
          if (!permanentDeleteTarget) {
            return;
          }
          try {
            await permanentDeleteStudent(permanentDeleteTarget.id);
            appToast.success("Student permanently deleted");
            setPermanentDeleteTarget(null);
            await loadData();
            await onSummaryRefresh?.();
          } catch (error) {
            appToast.error(getErrorMessage(error));
          }
        }}
      />

      <ConfirmDialog
        open={Boolean(statusTarget)}
        title={
          statusTarget?.action === "activate"
            ? "Activate Student"
            : "Deactivate Student"
        }
        description={
          statusTarget?.action === "activate"
            ? "Activate this student?"
            : "Deactivate this student?"
        }
        confirmLabel={
          statusTarget?.action === "activate" ? "Activate" : "Deactivate"
        }
        confirmVariant="primary"
        loading={isActivating || isDeactivating}
        onCancel={() => setStatusTarget(null)}
        onConfirm={handleStatusChange}
      />
    </>
  );
}
