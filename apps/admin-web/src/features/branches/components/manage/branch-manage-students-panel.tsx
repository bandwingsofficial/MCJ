"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Card } from "@/src/shared/components/ui/card";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { Pagination } from "@/src/shared/components/ui/pagination";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { BranchSectionToolbar } from "@/src/features/branches/components/manage/branch-section-toolbar";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/shared/components/ui/table";

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
          createHref={`/students/create?branchId=${branchId}`}
          createLabel="Add Student"
        />

        {isLoading ? (
          <p className="py-8 text-center text-sm text-slate-500">
            Loading students...
          </p>
        ) : students.length === 0 ? (
          <EmptyState
            title="No students found"
            description="No students belong to this branch yet."
          />
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Code</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Enrollment Count</TableHead>
                    <TableHead>Admission Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-mono text-sm text-slate-700">
                        {student.studentCode}
                      </TableCell>
                      <TableCell className="font-medium text-slate-900">
                        {formatPersonName(student.firstName, student.lastName)}
                      </TableCell>
                      <TableCell>{student.email ?? "—"}</TableCell>
                      <TableCell>{student.phone ?? "—"}</TableCell>
                      <TableCell>
                        {enrollmentCountByStudent[student.id] ?? 0}
                      </TableCell>
                      <TableCell>
                        {formatStudentDate(student.admissionDate)}
                      </TableCell>
                      <TableCell>
                        <StudentStatusBadge
                          status={student.status}
                          isActive={student.isActive}
                          isDeleted={isArchivedStudent(student)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </Card>

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
