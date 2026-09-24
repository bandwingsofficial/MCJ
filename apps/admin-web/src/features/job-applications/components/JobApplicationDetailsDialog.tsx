"use client";

import { useEffect, useState } from "react";

import { Button } from "@/src/shared/components/ui/button";
import { Loader } from "@/src/shared/components/ui/loader";
import { Modal } from "@/src/shared/components/ui/model";

import { JobApplicationDetailsContent } from "@/src/features/job-applications/components/JobApplicationDetailsContent";
import { jobApplicationService } from "@/src/features/job-applications/services/job-application.service";
import type { JobApplication } from "@/src/features/job-applications/types/job-application.types";
import {
  canApproveApplication,
  canManageAssignment,
  canRejectApplication,
  isInterviewAssigned,
} from "@/src/features/job-applications/types/job-application.types";

interface JobApplicationDetailsDialogProps {
  open: boolean;
  application: JobApplication | null;
  isActing?: boolean;
  onClose: () => void;
  onApprove: (application: JobApplication) => void;
  onReject: (application: JobApplication) => void;
  onAssignInterview?: (application: JobApplication) => void;
  onUnassignInterview?: (application: JobApplication) => void;
}

export function JobApplicationDetailsDialog({
  open,
  application,
  isActing = false,
  onClose,
  onApprove,
  onReject,
  onAssignInterview,
  onUnassignInterview,
}: JobApplicationDetailsDialogProps) {
  const [detail, setDetail] = useState<JobApplication | null>(application);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !application?.id) {
      setDetail(application);
      setLoadError(null);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const response = await jobApplicationService.getJobApplication(
          application.id,
        );
        if (!cancelled) {
          setDetail(response.data);
        }
      } catch (err) {
        if (!cancelled) {
          setDetail(application);
          setLoadError(
            err instanceof Error
              ? err.message
              : "Unable to load application details.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [open, application]);

  if (!application) {
    return null;
  }

  const current = detail ?? application;
  const showApprove = canApproveApplication(current.status);
  const showReject = canRejectApplication(current.status);
  const showAssign = canManageAssignment(current) && onAssignInterview;
  const assigned = isInterviewAssigned(current);
  const showUnassign =
    assigned && canManageAssignment(current) && onUnassignInterview;

  return (
    <Modal
      open={open}
      title="Application Details"
      onClose={onClose}
      contentClassName="!max-w-[760px]"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            disabled={isActing}
            onClick={onClose}
          >
            Close
          </Button>
          {showReject ? (
            <Button
              type="button"
              variant="danger"
              disabled={isActing}
              onClick={() => onReject(current)}
            >
              Reject
            </Button>
          ) : null}
          {showUnassign ? (
            <Button
              type="button"
              variant="outline"
              disabled={isActing}
              onClick={() => onUnassignInterview?.(current)}
            >
              Unassign
            </Button>
          ) : null}
          {showAssign ? (
            <Button
              type="button"
              disabled={isActing}
              onClick={() => onAssignInterview?.(current)}
            >
              {assigned ? "Manage Assignment" : "Assign Interviewer"}
            </Button>
          ) : null}
          {showApprove ? (
            <Button
              type="button"
              variant="success"
              disabled={isActing}
              onClick={() => onApprove(current)}
            >
              Shortlist
            </Button>
          ) : null}
        </>
      }
    >
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader />
        </div>
      ) : (
        <div className="space-y-5">
          {loadError ? (
            <p className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {loadError}
            </p>
          ) : null}
          <JobApplicationDetailsContent application={current} />
        </div>
      )}
    </Modal>
  );
}
