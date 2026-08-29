"use client";

import { useEffect, useState } from "react";

import { Button } from "@/src/shared/components/ui/button";
import { Modal } from "@/src/shared/components/ui/model";
import { AppSelect } from "@/src/shared/components/ui/select";
import { Textarea } from "@/src/shared/components/ui/textarea";

export interface UnenrollEnrollmentTarget {
  enrollmentId: string;
  studentName: string;
  branchName?: string;
  batchName?: string;
  courseTitle?: string;
}

const PRESET_REASONS = [
  "Student requested withdrawal",
  "Course change",
  "Batch change",
  "Branch change",
  "Administrative cancellation",
  "Other",
] as const;

interface UnenrollEnrollmentDialogProps {
  open: boolean;
  target: UnenrollEnrollmentTarget | null;
  loading?: boolean;
  onConfirm: (reason?: string) => void;
  onClose: () => void;
}

export function UnenrollEnrollmentDialog({
  open,
  target,
  loading = false,
  onConfirm,
  onClose,
}: UnenrollEnrollmentDialogProps) {
  const [preset, setPreset] = useState<string>("");
  const [customReason, setCustomReason] = useState("");

  useEffect(() => {
    if (!open) {
      setPreset("");
      setCustomReason("");
    }
  }, [open]);

  const resolvedReason =
    preset === "Other"
      ? customReason.trim()
      : preset.trim() || undefined;

  const handleConfirm = () => {
    onConfirm(resolvedReason);
  };

  return (
    <Modal open={open} title="Unenroll Student?" onClose={onClose}>
      <div className="space-y-4">
        {target ? (
          <div className="space-y-2 rounded-xl border border-[#E1EBF5] bg-[#F8FBFF] p-4 text-sm text-[#102A56]">
            <p>
              <span className="font-medium text-[#647A9B]">Student:</span>{" "}
              {target.studentName}
            </p>
            {target.branchName ? (
              <p>
                <span className="font-medium text-[#647A9B]">Branch:</span>{" "}
                {target.branchName}
              </p>
            ) : null}
            {target.batchName ? (
              <p>
                <span className="font-medium text-[#647A9B]">Batch:</span>{" "}
                {target.batchName}
              </p>
            ) : null}
            {target.courseTitle ? (
              <p>
                <span className="font-medium text-[#647A9B]">Course:</span>{" "}
                {target.courseTitle}
              </p>
            ) : null}
          </div>
        ) : null}

        <p className="text-sm text-amber-800">
          This will cancel the student&apos;s enrollment. The enrollment history
          will be preserved.
        </p>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#102A56]">
            Reason (optional)
          </label>
          <AppSelect
            value={preset}
            placeholder="Select a reason..."
            options={PRESET_REASONS.map((reason) => ({
              value: reason,
              label: reason,
            }))}
            onValueChange={setPreset}
          />
          {preset === "Other" ? (
            <Textarea
              value={customReason}
              onChange={(event) => setCustomReason(event.target.value)}
              placeholder="Enter reason..."
              className="min-h-24"
            />
          ) : null}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            loading={loading}
            disabled={preset === "Other" && !customReason.trim()}
          >
            Unenroll Student
          </Button>
        </div>
      </div>
    </Modal>
  );
}
