"use client";

import {
  normalizeAdminEnrollmentRowLifecycle,
  resolveAdminEnrollmentLifecycleForRowActions,
} from "@mcj/shared-constants";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/src/shared/components/ui/button";
import { Modal } from "@/src/shared/components/ui/model";
import { AppSelect } from "@/src/shared/components/ui/select";
import { Label } from "@/src/shared/components/ui/label";
import { Skeleton } from "@/src/shared/components/ui/skeleton";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { formatPersonName } from "@/src/features/branches/utils/branch-display.utils";

import { EnrollmentStatusBadge } from "../table/EnrollmentStatusBadge";
import type { Enrollment } from "../../types";
import { EnrollmentStatus } from "../../types/enrollment.enums";
import { enrollmentListDisplayStatus } from "../../utils/current-enrollment";
import { getEnrollmentWorkflowStatusChangeOptions } from "../../utils/enrollment-workflow-status.utils";
import { enrollmentService } from "../../services/enrollment.service";
import { StudentStatusBadge } from "@/src/features/students/components/StudentStatusBadge";
import type { StudentStatus } from "@/src/features/students/types/student.types";

interface UpdateEnrollmentStatusDialogProps {
  open: boolean;
  enrollmentId: string | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (status: EnrollmentStatus) => void;
}

function lifecycleFromEnrollment(
  enrollment: Enrollment,
): string | null {
  return resolveAdminEnrollmentLifecycleForRowActions({
    enrollmentStatus: enrollment.status,
    isActive: enrollment.isActive,
  });
}

export function UpdateEnrollmentStatusDialog({
  open,
  enrollmentId,
  loading,
  onClose,
  onSubmit,
}: UpdateEnrollmentStatusDialogProps) {
  const [nextStatus, setNextStatus] = useState<string>("");
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [isLoadingEnrollment, setIsLoadingEnrollment] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !enrollmentId) {
      setEnrollment(null);
      setLoadError(null);
      setNextStatus("");
      return;
    }

    let cancelled = false;

    const load = async () => {
      setIsLoadingEnrollment(true);
      setLoadError(null);
      setNextStatus("");

      try {
        const response = await enrollmentService.getEnrollment(enrollmentId);
        if (cancelled) {
          return;
        }
        setEnrollment(response.data);
      } catch (error) {
        if (cancelled) {
          return;
        }
        setEnrollment(null);
        setLoadError(
          error instanceof Error
            ? error.message
            : "Failed to load enrollment status.",
        );
      } finally {
        if (!cancelled) {
          setIsLoadingEnrollment(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [open, enrollmentId]);

  const statusInput = enrollment
    ? {
        enrollmentStatus: enrollment.status,
        studentStatus: enrollment.student?.status,
        isActive: enrollment.isActive,
      }
    : {
        enrollmentStatus: EnrollmentStatus.ADMITTED,
        studentStatus: null,
        isActive: true,
      };

  const currentWorkflow = enrollment
    ? lifecycleFromEnrollment(enrollment) ?? "ADMITTED"
    : "ADMITTED";

  const statusOptions = useMemo(
    () => getEnrollmentWorkflowStatusChangeOptions(statusInput),
    [
      enrollment?.id,
      enrollment?.status,
      enrollment?.isActive,
      enrollment?.student?.status,
    ],
  );

  const displayStatus = enrollment
    ? enrollmentListDisplayStatus(enrollment)
    : EnrollmentStatus.ADMITTED;

  const canSave =
    Boolean(enrollment) &&
    Boolean(nextStatus) &&
    nextStatus !== enrollment!.status &&
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
      {isLoadingEnrollment ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      ) : loadError ? (
        <ErrorState
          title="Could not load enrollment"
          description={loadError}
          onRetry={() => {
            if (enrollmentId) {
              void enrollmentService.getEnrollment(enrollmentId).then((response) => {
                setEnrollment(response.data);
                setLoadError(null);
              });
            }
          }}
        />
      ) : enrollment ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm">
            <p className="font-semibold text-[#102A56]">
              {formatPersonName(
                enrollment.student?.firstName,
                enrollment.student?.lastName,
              ) || enrollment.enrollmentNumber}
            </p>
            <p className="mt-0.5 font-mono text-slate-600">
              {enrollment.student?.studentCode ?? enrollment.enrollmentNumber}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500">Enrollment status</span>
              <EnrollmentStatusBadge
                status={displayStatus}
                isDeleted={enrollment.isDeleted}
              />
            </div>
            {enrollment.student?.status ? (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-500">Student status</span>
                <StudentStatusBadge
                  status={enrollment.student.status as StudentStatus}
                />
              </div>
            ) : null}
            {normalizeAdminEnrollmentRowLifecycle(enrollment.status) ===
              "COMPLETED" &&
            enrollment.student?.status &&
            enrollment.student.status !== "COMPLETED" ? (
              <p className="mt-2 text-xs text-amber-800">
                Placed is only available when the student&apos;s current status
                is Completed. This enrollment is completed, but the student is{" "}
                {enrollment.student.status.toLowerCase()} (for example after
                re-enrollment or cancellation).
              </p>
            ) : null}
            {normalizeAdminEnrollmentRowLifecycle(enrollment.status) ===
            null ? (
              <p className="mt-2 text-xs text-amber-700">
                This enrollment status cannot be changed from the admin list.
              </p>
            ) : null}
            {statusOptions.length === 0 &&
            normalizeAdminEnrollmentRowLifecycle(enrollment.status) !==
              null &&
            normalizeAdminEnrollmentRowLifecycle(enrollment.status) !==
              "CANCELLED" ? (
              <p className="mt-2 text-xs text-slate-600">
                No status changes are available for this enrollment row.
              </p>
            ) : null}
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
              disabled={!canSave || currentWorkflow === "CANCELLED"}
              onClick={() => onSubmit(nextStatus as EnrollmentStatus)}
            >
              Save
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
