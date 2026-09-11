"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";

import type {
  BatchCalendarDayCell,
  BatchCalendarExceptionStatus,
} from "@/src/features/batches/types/batch.types";
import {
  batchCalendarDayCellClass,
  batchCalendarDayLabel,
  formatBatchCalendarDate,
  formatBatchCalendarDayName,
} from "@/src/features/batches/utils/batch-calendar-display.utils";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";
import { Modal } from "@/src/shared/components/ui/model";
import { Button } from "@/src/shared/components/ui/button";
import { AppSelect } from "@/src/shared/components/ui/select";
import { cn } from "@/src/shared/lib/cn";

const STATUS_OPTIONS: Array<{
  value: BatchCalendarExceptionStatus;
  label: string;
}> = [
  { value: "HOLIDAY", label: "Holiday" },
  { value: "NON_WORKING", label: "Non-Working Day" },
  { value: "WORKING", label: "Working Day" },
];

interface Props {
  open: boolean;
  day: BatchCalendarDayCell | null;
  modeLabel: string;
  saving?: boolean;
  onClose: () => void;
  onSave: (payload: {
    status: BatchCalendarExceptionStatus;
    reason?: string;
  }) => Promise<void>;
  onRestoreDefault: () => Promise<void>;
}

function DialogField({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-[#E8F0FA] bg-[#F8FBFF]/60 px-3 py-2">
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-medium text-[#102A56]">{value}</dd>
    </div>
  );
}

export function BatchCalendarDateDialog({
  open,
  day,
  modeLabel,
  saving = false,
  onClose,
  onSave,
  onRestoreDefault,
}: Props) {
  const [status, setStatus] = useState<BatchCalendarExceptionStatus>("HOLIDAY");
  const [reason, setReason] = useState("");
  const [confirmRestoreOpen, setConfirmRestoreOpen] = useState(false);

  useEffect(() => {
    if (!day) return;
    if (day.dayType === "HOLIDAY") {
      setStatus("HOLIDAY");
      setReason(day.reason ?? "");
      return;
    }
    if (day.dayType === "NON_WORKING") {
      setStatus("NON_WORKING");
      setReason("");
      return;
    }
    if (day.dayType === "SUNDAY") {
      setStatus("WORKING");
      setReason("");
      return;
    }
    setStatus("WORKING");
    setReason("");
  }, [day]);

  const hasException = useMemo(() => day?.hasException === true, [day]);

  if (!day) {
    return null;
  }

  return (
    <>
      <Modal
        open={open}
        title="Holiday / Date Management"
        onClose={onClose}
        contentClassName="max-w-xl"
        footer={
          <div className="flex w-full flex-wrap items-center justify-end gap-2">
            {hasException ? (
              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={() => setConfirmRestoreOpen(true)}
              >
                Restore Default
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={saving || (status === "HOLIDAY" && !reason.trim())}
              loading={saving}
              onClick={() =>
                onSave({
                  status,
                  reason: status === "HOLIDAY" ? reason.trim() : undefined,
                })
              }
            >
              Save Changes
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-[#E1EBF5] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] px-4 py-3">
            <p className="text-sm font-medium text-[#102A56]">
              {modeLabel} · {formatBatchCalendarDate(day.dateKey)}
            </p>
            <p className="mt-0.5 text-xs text-[#647A9B]">
              Changes apply only to this learning mode&apos;s calendar for this
              batch.
            </p>
          </div>

          <div
            className={cn(
              "rounded-xl border px-3 py-3 shadow-sm",
              batchCalendarDayCellClass(day.dayType),
            )}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide opacity-80">
              Current Status
            </p>
            <p className="mt-1 text-sm font-semibold">
              {batchCalendarDayLabel(day.dayType)}
              {day.reason?.trim() ? ` · ${day.reason.trim()}` : ""}
            </p>
          </div>

          <dl className="grid gap-3 sm:grid-cols-2">
            <DialogField
              label="Date"
              value={formatBatchCalendarDate(day.dateKey)}
            />
            <DialogField
              label="Day"
              value={formatBatchCalendarDayName(day.dateKey)}
            />
            <DialogField label="Learning Mode" value={modeLabel} />
            <DialogField
              label="Exception Saved"
              value={hasException ? "Yes" : "No"}
            />
          </dl>

          <div>
            <Label htmlFor="calendar-status">Mark As</Label>
            <AppSelect
              value={status}
              onValueChange={(value) =>
                setStatus(value as BatchCalendarExceptionStatus)
              }
              triggerClassName="mt-1 h-11 w-full"
              options={STATUS_OPTIONS.map((option) => ({
                label: option.label,
                value: option.value,
              }))}
            />
          </div>

          {status === "HOLIDAY" ? (
            <div>
              <Label htmlFor="calendar-reason">Holiday Reason</Label>
              <Input
                id="calendar-reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="e.g. Independence Day"
                className="mt-1"
              />
            </div>
          ) : null}
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmRestoreOpen}
        title="Restore default day?"
        description="This removes the saved calendar exception for this date and restores the default schedule rule. Historical attendance records are not affected."
        loading={saving}
        confirmLabel="Restore"
        confirmVariant="danger"
        onCancel={() => setConfirmRestoreOpen(false)}
        onConfirm={async () => {
          await onRestoreDefault();
          setConfirmRestoreOpen(false);
        }}
      />
    </>
  );
}
