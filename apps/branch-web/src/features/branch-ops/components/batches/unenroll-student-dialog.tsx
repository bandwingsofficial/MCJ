"use client";

import { useEffect, useState } from "react";

import { Button } from "@/src/shared/components/ui/button";
import { Modal } from "@/src/shared/components/ui/model";
import { Textarea } from "@/src/shared/components/ui/textarea";

export interface UnenrollStudentTarget {
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

interface Props {
  open: boolean;
  target: UnenrollStudentTarget | null;
  loading?: boolean;
  onConfirm: (reason?: string) => void;
  onClose: () => void;
}

export function UnenrollStudentDialog({
  open,
  target,
  loading = false,
  onConfirm,
  onClose,
}: Props) {
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
          <select
            className="flex h-[46px] w-full rounded-xl border border-[#DCE8F5] bg-white px-4 text-sm text-[#102A56]"
            value={preset}
            onChange={(event) => setPreset(event.target.value)}
          >
            <option value="">Select a reason...</option>
            {PRESET_REASONS.map((reason) => (
              <option key={reason} value={reason}>
                {reason}
              </option>
            ))}
          </select>
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
            onClick={() => onConfirm(resolvedReason)}
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
