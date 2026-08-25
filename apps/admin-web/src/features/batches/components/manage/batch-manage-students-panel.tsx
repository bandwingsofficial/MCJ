"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { Checkbox } from "@/src/shared/components/ui/checkbox";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { AppSelect } from "@/src/shared/components/ui/select";
import { Modal } from "@/src/shared/components/ui/model";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { BranchSectionToolbar } from "@/src/features/branches/components/manage/branch-section-toolbar";
import { EnrollmentStatusBadge } from "@/src/features/enrollments/components/table/EnrollmentStatusBadge";
import { enrollmentService } from "@/src/features/enrollments/services/enrollment.service";
import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";
import { parseEnrollmentListResponse } from "@/src/features/enrollments/utils/enrollment-list.utils";
import { studentService } from "@/src/features/students/services/student.service";
import type { StudentListItem } from "@/src/features/students/types/student.types";
import { parseStudentListResponse } from "@/src/features/students/utils/student-list.utils";
import { uniqueSelectOptions } from "@/src/features/batches/utils/batch-select.utils";
import type { Batch } from "@/src/features/batches/types/batch.types";

interface Props {
  batch: Batch;
  disabled?: boolean;
  onUpdated: () => Promise<void>;
}

function formatStudentName(enrollment: Enrollment): string {
  return [enrollment.student.firstName, enrollment.student.lastName]
    .filter(Boolean)
    .join(" ");
}

export function BatchManageStudentsPanel({
  batch,
  disabled = false,
  onUpdated,
}: Props) {
  const [search, setSearch] = useState("");
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [selectedEnrollmentIds, setSelectedEnrollmentIds] = useState<string[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [activeStudents, setActiveStudents] = useState<StudentListItem[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>();
  const [isAdding, setIsAdding] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<Enrollment | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const loadEnrollments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await enrollmentService.getEnrollments({
        batchId: batch.id,
        skip: 0,
        take: 500,
        includeDeleted: false,
      });
      const payload = parseEnrollmentListResponse(response);
      setEnrollments(payload.items);
    } catch (error) {
      appToast.error(getErrorMessage(error));
      setEnrollments([]);
    } finally {
      setIsLoading(false);
    }
  }, [batch.id]);

  useEffect(() => {
    void loadEnrollments();
  }, [loadEnrollments]);

  const enrolledStudentIds = useMemo(
    () => new Set(enrollments.map((item) => item.student.id)),
    [enrollments],
  );

  const filteredEnrollments = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return enrollments;
    }

    return enrollments.filter((enrollment) => {
      const haystack = [
        formatStudentName(enrollment),
        enrollment.student.email ?? "",
        enrollment.student.phone ?? "",
        enrollment.branch?.branchName ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [enrollments, search]);

  const visibleIds = filteredEnrollments.map((item) => item.id);
  const selectedVisibleCount = visibleIds.filter((id) =>
    selectedEnrollmentIds.includes(id),
  ).length;
  const allVisibleSelected =
    visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;

  const toggleRow = (enrollmentId: string, checked: boolean) => {
    setSelectedEnrollmentIds((current) =>
      checked
        ? Array.from(new Set([...current, enrollmentId]))
        : current.filter((id) => id !== enrollmentId),
    );
  };

  const toggleAllVisible = (checked: boolean) => {
    if (!checked) {
      setSelectedEnrollmentIds((current) =>
        current.filter((id) => !visibleIds.includes(id)),
      );
      return;
    }

    setSelectedEnrollmentIds((current) =>
      Array.from(new Set([...current, ...visibleIds])),
    );
  };

  const openAddModal = async () => {
    setAddOpen(true);
    setSelectedStudentId(undefined);
    setIsLoadingStudents(true);

    try {
      const response = await studentService.getStudents({
        includeDeleted: false,
        onlyActive: true,
        page: 1,
        pageSize: 200,
      });
      const payload = parseStudentListResponse(response.data);
      setActiveStudents(
        payload.items.filter(
          (student) => student.isActive && !enrolledStudentIds.has(student.id),
        ),
      );
    } catch (error) {
      appToast.error(getErrorMessage(error));
      setActiveStudents([]);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const studentOptions = useMemo(
    () =>
      uniqueSelectOptions(
        activeStudents.map((student) => ({
          label: [student.firstName, student.lastName].filter(Boolean).join(" "),
          value: student.id,
        })),
      ),
    [activeStudents],
  );

  const handleAddStudent = async () => {
    if (!selectedStudentId) {
      appToast.error("Select a student.");
      return;
    }

    setIsAdding(true);
    try {
      await enrollmentService.createEnrollment({
        studentId: selectedStudentId,
        batchId: batch.id,
        feeAmount: 0,
        discountAmount: 0,
      });
      appToast.success("Student added to batch");
      setAddOpen(false);
      await loadEnrollments();
      await onUpdated();
    } catch (error) {
      appToast.error(getErrorMessage(error));
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemove = async () => {
    if (!removeTarget) {
      return;
    }

    setIsRemoving(true);
    try {
      await enrollmentService.deleteEnrollment(removeTarget.id);
      setRemoveTarget(null);
      setEnrollments((current) =>
        current.filter((item) => item.id !== removeTarget.id),
      );
      await onUpdated();
    } catch (error) {
      appToast.error(getErrorMessage(error));
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <>
      <Card className="rounded-xl border border-slate-200/80 p-4 shadow-sm">
        <BranchSectionToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search students..."
          assignLabel="Add Student"
          assignDisabled={disabled || isLoading}
          onAssign={() => {
            void openAddModal();
          }}
        />

        <div className="w-full min-w-0 overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full table-fixed border-collapse">
            <colgroup>
              <col className="w-11" />
              <col />
              <col />
              <col className="w-[7rem]" />
              <col />
              <col className="w-[7rem]" />
              <col className="w-[4.5rem]" />
            </colgroup>
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="w-11 px-3 py-3 text-left">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300"
                    checked={allVisibleSelected}
                    disabled={disabled || filteredEnrollments.length === 0}
                    onChange={(event) => {
                      toggleAllVisible(event.target.checked);
                    }}
                    aria-label="Select all students on this page"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Student
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Phone
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Branch
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-sm text-slate-500"
                  >
                    Loading students...
                  </td>
                </tr>
              ) : filteredEnrollments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <p className="text-sm font-medium text-slate-900">
                      No students enrolled yet
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Add students to this batch to get started.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredEnrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="hover:bg-slate-50">
                    <td className="px-3 py-3 align-middle">
                      <Checkbox
                        checked={selectedEnrollmentIds.includes(enrollment.id)}
                        disabled={disabled}
                        onCheckedChange={(checked) => {
                          toggleRow(enrollment.id, Boolean(checked));
                        }}
                      />
                    </td>
                    <td className="truncate px-4 py-3 text-sm font-medium text-slate-900">
                      {formatStudentName(enrollment)}
                    </td>
                    <td className="truncate px-4 py-3 text-sm text-slate-700">
                      {enrollment.student.email ?? "—"}
                    </td>
                    <td className="truncate px-4 py-3 text-sm text-slate-700">
                      {enrollment.student.phone ?? "—"}
                    </td>
                    <td className="truncate px-4 py-3 text-sm text-slate-700">
                      {enrollment.branch?.branchName ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <EnrollmentStatusBadge status={enrollment.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={disabled || isRemoving}
                        onClick={() => setRemoveTarget(enrollment)}
                        aria-label="Remove student from batch"
                        className="h-9 w-9 rounded-lg p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="h-[1.25rem] w-[1.25rem]" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={addOpen}
        title="Add Student"
        onClose={() => {
          if (!isAdding) {
            setAddOpen(false);
          }
        }}
        contentClassName="w-[calc(100vw-2rem)] max-w-lg !overflow-y-auto !overflow-x-hidden"
      >
        <div className="space-y-4">
          {isLoadingStudents ? (
            <p className="py-6 text-center text-sm text-slate-500">
              Loading active students...
            </p>
          ) : (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-900">
                Student
              </label>
              <AppSelect
                value={selectedStudentId}
                placeholder="Select active student"
                options={studentOptions}
                onValueChange={setSelectedStudentId}
              />
            </div>
          )}

          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <Button
              type="button"
              variant="outline"
              disabled={isAdding}
              onClick={() => setAddOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={
                disabled ||
                isAdding ||
                isLoadingStudents ||
                !selectedStudentId
              }
              onClick={() => {
                void handleAddStudent();
              }}
            >
              {isAdding ? "Adding..." : "Add Student"}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(removeTarget)}
        title="Remove student from batch?"
        description={
          removeTarget
            ? `Remove ${formatStudentName(removeTarget)} from this batch? The student record will remain in the system.`
            : ""
        }
        confirmLabel="Remove"
        loading={isRemoving}
        onCancel={() => setRemoveTarget(null)}
        onConfirm={() => {
          void handleRemove();
        }}
      />
    </>
  );
}
