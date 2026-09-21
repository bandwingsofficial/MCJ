"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/src/shared/components/ui/button";
import { Modal } from "@/src/shared/components/ui/model";
import { AppSelect } from "@/src/shared/components/ui/select";
import { appToast } from "@/src/shared/components/ui/toast";

import { branchService } from "@/src/features/branches/services/branch.service";
import { branchUserService } from "@/src/features/branch-users/services/branch-user.service";
import { jobApplicationService } from "@/src/features/job-applications/services/job-application.service";
import type { JobApplication } from "@/src/features/job-applications/types/job-application.types";
import {
  getApplicantEmail,
  getApplicantName,
  isInterviewAssigned,
} from "@/src/features/job-applications/types/job-application.types";

interface AssignInterviewDialogProps {
  open: boolean;
  application: JobApplication | null;
  onClose: () => void;
  onSuccess: () => Promise<void>;
  onUnassign?: (application: JobApplication) => void;
}

interface BranchOption {
  id: string;
  label: string;
}

interface InterviewerOption {
  id: string;
  label: string;
}

export function AssignInterviewDialog({
  open,
  application,
  onClose,
  onSuccess,
  onUnassign,
}: AssignInterviewDialogProps) {
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [interviewers, setInterviewers] = useState<InterviewerOption[]>([]);
  const [branchId, setBranchId] = useState("");
  const [interviewerId, setInterviewerId] = useState("");
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingInterviewers, setLoadingInterviewers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const preferredInterviewerIdRef = useRef<string | null>(null);

  const isManaging = Boolean(application && isInterviewAssigned(application));

  useEffect(() => {
    if (!open || !application) {
      setBranchId("");
      setInterviewerId("");
      setInterviewers([]);
      preferredInterviewerIdRef.current = null;
      return;
    }

    const assignment = application.interviewAssignment;
    preferredInterviewerIdRef.current = assignment?.interviewerId ?? null;
    setBranchId(assignment?.branchId ?? "");
    setInterviewerId(assignment?.interviewerId ?? "");

    let cancelled = false;

    const loadBranches = async () => {
      try {
        setLoadingBranches(true);
        const response = await branchService.getBranches({
          status: "ACTIVE",
          page: 1,
          pageSize: 100,
          search: "",
        });
        if (cancelled) {
          return;
        }
        setBranches(
          (response.data.items ?? []).map((branch) => ({
            id: branch.id,
            label: `${branch.branchName} (${branch.branchCode})`,
          })),
        );
      } catch (error) {
        if (!cancelled) {
          appToast.error(
            error instanceof Error
              ? error.message
              : "Unable to load branches.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingBranches(false);
        }
      }
    };

    void loadBranches();

    return () => {
      cancelled = true;
    };
  }, [open, application]);

  useEffect(() => {
    if (!open || !branchId) {
      setInterviewers([]);
      if (!preferredInterviewerIdRef.current) {
        setInterviewerId("");
      }
      return;
    }

    let cancelled = false;

    const loadInterviewers = async () => {
      try {
        setLoadingInterviewers(true);
        const response = await branchUserService.getBranchUsers({
          branchId,
          role: "INTERVIEWER",
          status: "ACTIVE",
          page: 1,
          pageSize: 100,
          search: "",
        });
        if (cancelled) {
          return;
        }
        const options = (response.data.items ?? []).map((user) => ({
          id: user.id,
          label:
            [user.firstName, user.lastName].filter(Boolean).join(" ") ||
            user.email,
        }));
        setInterviewers(options);

        const preferred = preferredInterviewerIdRef.current;
        if (preferred && options.some((item) => item.id === preferred)) {
          setInterviewerId(preferred);
          preferredInterviewerIdRef.current = null;
        } else if (
          preferred &&
          !options.some((item) => item.id === preferred)
        ) {
          setInterviewerId("");
          preferredInterviewerIdRef.current = null;
        } else if (!preferred) {
          setInterviewerId((current) =>
            options.some((item) => item.id === current) ? current : "",
          );
        }
      } catch (error) {
        if (!cancelled) {
          setInterviewers([]);
          appToast.error(
            error instanceof Error
              ? error.message
              : "Unable to load interviewers.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingInterviewers(false);
        }
      }
    };

    void loadInterviewers();

    return () => {
      cancelled = true;
    };
  }, [open, branchId]);

  const selectedBranch = useMemo(
    () => branches.find((item) => item.id === branchId)?.label ?? "—",
    [branches, branchId],
  );
  const selectedInterviewer = useMemo(
    () =>
      interviewers.find((item) => item.id === interviewerId)?.label ?? "—",
    [interviewers, interviewerId],
  );

  if (!application) {
    return null;
  }

  const canSubmit =
    Boolean(branchId) && Boolean(interviewerId) && !submitting;

  const handleBranchChange = (value: string) => {
    preferredInterviewerIdRef.current = null;
    setBranchId(value);
    setInterviewerId("");
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }

    try {
      setSubmitting(true);
      await jobApplicationService.assignInterview(application.id, {
        branchId,
        interviewerId,
      });
      appToast.success(
        isManaging
          ? "Assignment updated successfully."
          : "Interviewer assigned successfully.",
      );
      await onSuccess();
      onClose();
    } catch (error) {
      appToast.error(
        error instanceof Error
          ? error.message
          : "Unable to save assignment.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      title={isManaging ? "Manage Assignment" : "Assign Interviewer"}
      onClose={onClose}
      contentClassName="!max-w-[560px]"
    >
      <div className="space-y-4">
        <div className="grid gap-3 rounded-xl border border-[#E1EBF5] bg-[#F8FBFF] p-3 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#647A9B]">
              Candidate
            </p>
            <p className="mt-1 text-[#102A56]">{getApplicantName(application)}</p>
            <p className="text-xs text-[#647A9B]">
              {getApplicantEmail(application)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#647A9B]">
              Job
            </p>
            <p className="mt-1 text-[#102A56]">{application.job?.title || "—"}</p>
            <p className="text-xs text-[#647A9B]">
              {application.job?.companyName || "—"}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#647A9B]">Branch</label>
            <AppSelect
              value={branchId}
              placeholder={loadingBranches ? "Loading branches..." : "Select branch"}
              disabled={loadingBranches || submitting}
              options={branches.map((branch) => ({
                label: branch.label,
                value: branch.id,
              }))}
              onValueChange={handleBranchChange}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#647A9B]">
              Interviewer
            </label>
            <AppSelect
              value={interviewerId}
              placeholder={
                !branchId
                  ? "Select a branch first"
                  : loadingInterviewers
                    ? "Loading interviewers..."
                    : interviewers.length
                      ? "Select interviewer"
                      : "No active interviewers"
              }
              disabled={
                !branchId ||
                loadingInterviewers ||
                submitting ||
                interviewers.length === 0
              }
              options={interviewers.map((item) => ({
                label: item.label,
                value: item.id,
              }))}
              onValueChange={setInterviewerId}
            />
            {branchId && !loadingInterviewers && interviewers.length === 0 ? (
              <p className="text-xs text-amber-700">
                No active interviewers are assigned to this branch.
              </p>
            ) : null}
          </div>
        </div>

        <div className="rounded-xl border border-[#E1EBF5] bg-white p-3 text-xs text-[#647A9B]">
          <p className="font-medium text-[#102A56]">Assignment summary</p>
          <div className="mt-2 grid gap-1 sm:grid-cols-2">
            <p>Branch: {selectedBranch}</p>
            <p>Interviewer: {selectedInterviewer}</p>
          </div>
          <p className="mt-2">
            The branch interviewer will schedule the interview date, time, mode,
            and meeting details in Branch-web.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          {isManaging && onUnassign ? (
            <Button
              variant="outline"
              disabled={submitting}
              className="border-amber-200 text-amber-800 hover:bg-amber-50"
              onClick={() => onUnassign(application)}
            >
              Unassign
            </Button>
          ) : (
            <span />
          )}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                void handleSubmit();
              }}
              loading={submitting}
              disabled={!canSubmit}
            >
              {isManaging ? "Update Assignment" : "Assign Interviewer"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
