"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/src/shared/components/ui/button";
import { Modal } from "@/src/shared/components/ui/model";
import { AppSelect } from "@/src/shared/components/ui/select";
import { Label } from "@/src/shared/components/ui/label";
import { formatPersonName } from "@/src/features/branches/utils/branch-display.utils";

import { EnrollmentStatusBadge } from "../table/EnrollmentStatusBadge";
import type { Enrollment } from "../../types";
import { EnrollmentStatus } from "../../types/enrollment.enums";
import { enrollmentListDisplayStatus } from "../../utils/current-enrollment";
import {
  getEnrollmentStatusChangeOptions,
  resolveSyncedLifecycleWorkflow,
} from "../../utils/enrollment-workflow-status.utils";

interface UpdateEnrollmentStatusDialogProps {
  open: boolean;
  enrollment: Enrollment | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (status: EnrollmentStatus) => void;
}

export function UpdateEnrollmentStatusDialog({
  open,
  enrollment,
  loading,
  onClose,
  onSubmit,
}: UpdateEnrollmentStatusDialogProps) {
  const [nextStatus, setNextStatus] = useState<string>("");

  const displayStatus = enrollment
    ? enrollmentListDisplayStatus(enrollment)
    : EnrollmentStatus.ADMITTED;

  const workflow = enrollment
    ? resolveSyncedLifecycleWorkflow({
        enrollmentStatus: enrollment.status,
        studentStatus: enrollment.student?.status,
      })
    : "ADMITTED";

  useEffect(() => {
    if (open) {
      setNextStatus("");
    }
  }, [open, enrollment?.id]);

  const statusOptions = useMemo(
    () => getEnrollmentStatusChangeOptions(workflow),
    [workflow],
  );

  if (!enrollment) {
    return null;
  }

  const studentName =
    formatPersonName(
      enrollment.student?.firstName,
      enrollment.student?.lastName,
    ) || enrollment.enrollmentNumber;

  const canSave =
    Boolean(nextStatus) &&
    nextStatus !== displayStatus &&
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
          <p className="font-semibold text-[#102A56]">{studentName}</p>
          <p className="mt-0.5 font-mono text-slate-600">
            {enrollment.student?.studentCode ?? enrollment.enrollmentNumber}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-slate-500">Current status</span>
            <EnrollmentStatusBadge
              status={displayStatus}
              isDeleted={enrollment.isDeleted}
            />
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
            onClick={() => onSubmit(nextStatus as EnrollmentStatus)}
          >
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
}
