"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/src/shared/components/ui/button";
import { Modal } from "@/src/shared/components/ui/model";
import { AppSelect } from "@/src/shared/components/ui/select";
import { Label } from "@/src/shared/components/ui/label";

import {
  STUDENT_ADMISSION_STATUS_OPTIONS,
  STUDENT_STATUSES,
} from "@/src/features/students/constants/student.constants";
import type {
  StudentListItem,
  StudentStatus,
} from "@/src/features/students/types/student.types";
import { StudentStatusBadge } from "@/src/features/students/components/StudentStatusBadge";

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
  const [status, setStatus] = useState<StudentStatus>("LEAD");

  useEffect(() => {
    if (open && student) {
      setStatus(student.status);
    }
  }, [open, student]);

  const statusOptions = useMemo(() => {
    if (!student) {
      return [...STUDENT_ADMISSION_STATUS_OPTIONS];
    }

    const options = [...STUDENT_ADMISSION_STATUS_OPTIONS];
    if (!options.some((option) => option.value === student.status)) {
      const label =
        STUDENT_STATUSES.find((item) => item.value === student.status)
          ?.label ?? student.status;
      options.unshift({ label, value: student.status });
    }

    return options;
  }, [student]);

  if (!student) {
    return null;
  }

  return (
    <Modal
      open={open}
      title="Update Admission Status"
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
          <Label required>Status</Label>
          <AppSelect
            value={status}
            onValueChange={(value) => setStatus(value as StudentStatus)}
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
            onClick={() => onSubmit(status)}
          >
            Update
          </Button>
        </div>
      </div>
    </Modal>
  );
}
