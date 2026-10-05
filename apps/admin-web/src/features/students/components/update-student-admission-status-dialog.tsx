"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/src/shared/components/ui/button";
import { Modal } from "@/src/shared/components/ui/model";
import { AppSelect } from "@/src/shared/components/ui/select";
import { Label } from "@/src/shared/components/ui/label";
import { Skeleton } from "@/src/shared/components/ui/skeleton";
import { ErrorState } from "@/src/shared/components/ui/error-state";

import type { StudentStatus } from "@/src/features/students/types/student.types";
import { StudentStatusBadge } from "@/src/features/students/components/StudentStatusBadge";
import { getStudentStatusChangeOptions } from "@/src/features/students/utils/student-workflow-status.utils";
import { studentService } from "@/src/features/students/services/student.service";
import type { Student } from "@/src/features/students/types/student.types";

interface UpdateStudentAdmissionStatusDialogProps {
  open: boolean;
  studentId: string | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (status: StudentStatus) => void;
}

function formatStudentName(student: Student): string {
  return [student.firstName, student.lastName].filter(Boolean).join(" ");
}

export function UpdateStudentAdmissionStatusDialog({
  open,
  studentId,
  loading,
  onClose,
  onSubmit,
}: UpdateStudentAdmissionStatusDialogProps) {
  const [nextStatus, setNextStatus] = useState<string>("");
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoadingStudent, setIsLoadingStudent] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !studentId) {
      setStudent(null);
      setLoadError(null);
      setNextStatus("");
      return;
    }

    let cancelled = false;

    const load = async () => {
      setIsLoadingStudent(true);
      setLoadError(null);
      setNextStatus("");

      try {
        const response = await studentService.getStudent(studentId);
        if (cancelled) {
          return;
        }
        setStudent(response.data);
      } catch (error) {
        if (cancelled) {
          return;
        }
        setStudent(null);
        setLoadError(
          error instanceof Error
            ? error.message
            : "Failed to load student status.",
        );
      } finally {
        if (!cancelled) {
          setIsLoadingStudent(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [open, studentId]);

  const statusOptions = useMemo(() => {
    if (!student) {
      return [];
    }

    return getStudentStatusChangeOptions(student.status);
  }, [student]);

  useEffect(() => {
    if (open && student) {
      setNextStatus("");
    }
  }, [open, student?.id, student?.status]);

  const canSave =
    Boolean(student) &&
    Boolean(nextStatus) &&
    nextStatus !== student!.status &&
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
      {isLoadingStudent ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      ) : loadError ? (
        <ErrorState
          title="Could not load student"
          description={loadError}
          onRetry={() => {
            if (studentId) {
              void studentService.getStudent(studentId).then((response) => {
                setStudent(response.data);
                setLoadError(null);
              });
            }
          }}
        />
      ) : student ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm">
            <p className="font-semibold text-[#102A56]">
              {formatStudentName(student)}
            </p>
            <p className="mt-0.5 font-mono text-slate-600">
              {student.studentCode}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500">Current status</span>
              <StudentStatusBadge status={student.status} />
            </div>
          </div>

          <div className="grid gap-1">
            <Label required>New status</Label>
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
      ) : null}
    </Modal>
  );
}
