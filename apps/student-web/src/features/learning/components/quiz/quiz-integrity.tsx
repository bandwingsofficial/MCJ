"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";

interface QuizSubmitDialogProps {
  open: boolean;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function QuizSubmitDialog({
  open,
  loading = false,
  onCancel,
  onConfirm,
}: QuizSubmitDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="quiz-submit-title"
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
      >
        <h3
          id="quiz-submit-title"
          className="text-lg font-semibold text-[#0B1F3A]"
        >
          Submit Quiz?
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Are you sure you want to submit this quiz? Once submitted, you cannot
          change your answers.
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            className="rounded-lg"
            disabled={loading}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="rounded-lg bg-[#0B1F3A] hover:bg-[#102A56]"
            loading={loading}
            onClick={onConfirm}
          >
            Submit Quiz
          </Button>
        </div>
      </div>
    </div>
  );
}

interface QuizTabWarningProps {
  switchCount: number;
  maxSwitches?: number;
  onDismiss: () => void;
}

export function QuizTabWarning({
  switchCount,
  maxSwitches = 3,
  onDismiss,
}: QuizTabWarningProps) {
  const cappedCount = Math.min(switchCount, maxSwitches);

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-amber-900">
            Quiz tab switch detected
          </p>
          <p className="mt-1 text-sm text-amber-800">
            You left the quiz window or switched browser tabs. Please stay on
            this page until you finish. Your timer is still running. (
            {cappedCount}/{maxSwitches})
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 rounded-lg border-amber-200 bg-white"
          onClick={onDismiss}
        >
          Dismiss
        </Button>
      </div>
    </div>
  );
}

interface QuizCopyGuardProps {
  active: boolean;
  children: React.ReactNode;
}

export function QuizCopyGuard({ active, children }: QuizCopyGuardProps) {
  if (!active) {
    return children;
  }

  return (
    <div
      className="select-none [&_*]:select-none"
      onCopy={(event) => event.preventDefault()}
      onCut={(event) => event.preventDefault()}
      onContextMenu={(event) => event.preventDefault()}
    >
      {children}
    </div>
  );
}
