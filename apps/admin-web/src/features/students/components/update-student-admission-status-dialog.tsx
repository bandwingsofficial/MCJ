"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/src/shared/components/ui/button";
import { Modal } from "@/src/shared/components/ui/model";
import { AppSelect } from "@/src/shared/components/ui/select";
import { Label } from "@/src/shared/components/ui/label";

import type {
  StudentListItem,
  StudentStatus,
} from "@/src/features/students/types/student.types";
import { StudentStatusBadge } from "@/src/features/students/components/StudentStatusBadge";
import { getStudentStatusSelectOptions } from "@/src/features/students/utils/student-workflow-status.utils";

interface UpdateStudentAdmissionStatusDialogProps {
  open: boolean;
  student: StudentListItem | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (status: StudentStatus) => void;
}

function formatStudentName(student: StudentListItem): string {
  return [student.firstName, student.lastName].filter(Boolean).join(" ");
}

export function UpdateStudentAdmissionStatusDialog({
  open,
  student,
  loading,
  onClose,
  onSubmit,
}: UpdateStudentAdmissionStatusDialogProps) {
  const [nextStatus, setNextStatus] = useState<string>("");

  useEffect(() => {
    if (open && student) {
      setNextStatus(student.status);
    }
  }, [open, student?.id, student?.status]);

  const statusOptions = useMemo(() => {
    if (!student) {
      return [];
    }

    return getStudentStatusSelectOptions(student.status);
  }, [student]);

  if (!student) {
    return null;
  }

  const canSave =
    Boolean(nextStatus) &&
    nextStatus !== student.status &&
    statusOptions.some((option) => option.value === nextStatus);

  return (
    <Modal
      open={open}
      title="Change Status"
      onClose={() => {
        if (loading) {
          return;
        }
        onClose();
      }}
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm">
          <p className="font-semibold text-[#102A56]">
            {formatStudentName(student)}
          </p>
          <p className="mt-0.5 text-slate-600">{student.studentCode}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-slate-500">Current status</span>
            <StudentStatusBadge status={student.status} />
          </div>
        </div>

        <div className="grid gap-1">
          <Label required>Change status</Label>
          <AppSelect
            value={nextStatus}
            placeholder="Select status"
            onValueChange={(value) => setNextStatus(value)}
            options={statusOptions}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            loading={loading}
            disabled={!canSave}
            onClick={() => onSubmit(nextStatus as StudentStatus)}
          >
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
}
