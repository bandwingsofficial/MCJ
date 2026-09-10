"use client";

import { useEffect, useMemo, useState } from "react";

import type {
  BatchCalendarDayCell,
  BatchCalendarExceptionStatus,
} from "@/src/features/branch-ops/types";
import {
  batchCalendarDayLabel,
  formatBatchCalendarDate,
  formatBatchCalendarDayName,
} from "@/src/features/branch-ops/utils/batch-calendar-display.utils";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";
import { Modal } from "@/src/shared/components/ui/model";
import { Button } from "@/src/shared/components/ui/button";
import { AppSelect } from "@/src/shared/components/ui/select";

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
    setStatus("WORKING");
    setReason("");
  }, [day]);

  const hasException = useMemo(() => day?.hasException === true, [day]);

  if (!day) {
    return null;
  }

  const currentStatusLabel = batchCalendarDayLabel(day.dayType);

  return (
    <>
      <Modal
        open={open}
        title="Holiday / Date Management"
        description={`${modeLabel} · ${formatBatchCalendarDate(day.dateKey)}`}
        onClose={onClose}
        contentClassName="max-w-xl"
        footer={
          <>
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
            <Button type="button" variant="outline" disabled={saving} onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={saving || (status === "HOLIDAY" && !reason.trim())}
              onClick={() =>
                onSave({
                  status,
                  reason: status === "HOLIDAY" ? reason.trim() : undefined,
                })
              }
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Date</Label>
              <p className="mt-1 text-sm font-medium text-[#102A56]">
                {formatBatchCalendarDate(day.dateKey)}
              </p>
            </div>
            <div>
              <Label>Day</Label>
              <p className="mt-1 text-sm font-medium text-[#102A56]">
                {formatBatchCalendarDayName(day.dateKey)}
              </p>
            </div>
            <div>
              <Label>Learning Mode</Label>
              <p className="mt-1 text-sm font-medium text-[#102A56]">{modeLabel}</p>
            </div>
            <div>
              <Label>Current Status</Label>
              <p className="mt-1 text-sm font-medium text-[#102A56]">
                {currentStatusLabel}
              </p>
            </div>
          </div>

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
        description="This removes the saved calendar exception for this date and restores the default schedule rule."
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
