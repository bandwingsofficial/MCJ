"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import { BatchCalendarDateDialog } from "@/src/features/branch-ops/components/batches/calendar/batch-calendar-date-dialog";
import { BatchCalendarSummaryPanel } from "@/src/features/branch-ops/components/batches/calendar/batch-calendar-summary-panel";
import { BatchModeCalendarView } from "@/src/features/branch-ops/components/batches/calendar/batch-mode-calendar-view";
import type { BatchCalendarViewResponse } from "@/src/features/branch-ops/types";
import {
  batchManagePath,
  parseBatchModeParam,
} from "@/src/features/branch-ops/utils/batch-manage.routes";
import {
  formatBatchCalendarDate,
  initialCalendarMonthKey,
} from "@/src/features/branch-ops/utils/batch-calendar-display.utils";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Loader } from "@/src/shared/components/ui/loader";
import { appToast } from "@/src/shared/components/ui/toast";
import { currentMonthKey } from "@/src/features/branch-ops/utils/attendance-calendar.utils";

function resolveError(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "response" in err) {
    const message = (err as { response?: { data?: { message?: string } } })
      .response?.data?.message;
    if (message) return message;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

interface Props {
  batchId: string;
  modeParam: string;
}

export function BranchBatchModeCalendarPage({ batchId, modeParam }: Props) {
  const mode = parseBatchModeParam(modeParam);
  const [data, setData] = useState<BatchCalendarViewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [monthKey, setMonthKey] = useState<string | null>(null);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  useEffect(() => {
    if (!mode) {
      setError("Invalid learning mode.");
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    branchOpsApi
      .batchCalendarView(batchId, mode, monthKey ? { month: monthKey } : undefined)
      .then((response) => {
        if (cancelled) return;
        setData(response);
        if (!monthKey) {
          setMonthKey(
            initialCalendarMonthKey(response.batch.startDate) ||
              response.monthKey,
          );
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(resolveError(err, "Unable to load batch calendar."));
        setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [batchId, mode, monthKey]);

  const selectedDay =
    data?.days.find((day) => day.dateKey === selectedDateKey) ?? null;

  if (!mode) {
    return <ErrorState description="Invalid learning mode." />;
  }

  if (loading && !data) {
    return <Loader />;
  }

  if (error && !data) {
    return <ErrorState description={error} />;
  }

  if (!data) {
    return <ErrorState description="Calendar not available." />;
  }

  const reloadMonth = async (nextMonthKey: string) => {
    setLoading(true);
    try {
      const response = await branchOpsApi.batchCalendarView(batchId, mode, {
        month: nextMonthKey,
      });
      setData(response);
      setMonthKey(response.monthKey);
    } catch (err: unknown) {
      appToast.error(resolveError(err, "Unable to refresh calendar."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href={batchManagePath(batchId)}
            className="inline-flex items-center gap-1 text-sm font-medium text-[#2563EB] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Batch Management
          </Link>
          <h1 className="mt-2 text-xl font-semibold text-[#102A56]">
            {data.batch.name} · {data.modeLabel}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {data.scheduleLabel} · {formatBatchCalendarDate(data.batch.startDate)}
            {data.batch.endDate
              ? ` – ${formatBatchCalendarDate(data.batch.endDate)}`
              : ""}
          </p>
        </div>
      </div>

      <BatchCalendarSummaryPanel summary={data.summary} />

      <BatchModeCalendarView
        monthLabel={data.monthLabel}
        days={data.days}
        loading={loading}
        selectedDateKey={selectedDateKey}
        onSelectDate={setSelectedDateKey}
        onPreviousMonth={() => reloadMonth(data.previousMonthKey)}
        onNextMonth={() => reloadMonth(data.nextMonthKey)}
        showToday={data.monthKey !== currentMonthKey()}
        onToday={() => reloadMonth(currentMonthKey())}
      />

      <BatchCalendarDateDialog
        open={selectedDateKey != null}
        day={selectedDay}
        modeLabel={data.modeLabel}
        saving={saving}
        onClose={() => setSelectedDateKey(null)}
        onSave={async (payload) => {
          if (!selectedDateKey) return;
          setSaving(true);
          try {
            const result = await branchOpsApi.upsertBatchCalendarException(
              batchId,
              mode,
              {
                date: selectedDateKey,
                status: payload.status,
                reason: payload.reason,
              },
            );
            setData((current) =>
              current
                ? {
                    ...current,
                    summary: result.summary,
                    days: current.days.map((day) =>
                      day.dateKey === selectedDateKey && result.day
                        ? result.day
                        : day,
                    ),
                  }
                : current,
            );
            appToast.success("Calendar updated.");
            setSelectedDateKey(null);
          } catch (err: unknown) {
            appToast.error(resolveError(err, "Unable to save calendar change."));
          } finally {
            setSaving(false);
          }
        }}
        onRestoreDefault={async () => {
          if (!selectedDateKey) return;
          setSaving(true);
          try {
            const result = await branchOpsApi.deleteBatchCalendarException(
              batchId,
              mode,
              selectedDateKey,
            );
            setData((current) =>
              current
                ? {
                    ...current,
                    summary: result.summary,
                    days: current.days.map((day) =>
                      day.dateKey === selectedDateKey && result.day
                        ? result.day
                        : day,
                    ),
                  }
                : current,
            );
            appToast.success("Calendar restored to default.");
            setSelectedDateKey(null);
          } catch (err: unknown) {
            appToast.error(resolveError(err, "Unable to restore calendar day."));
          } finally {
            setSaving(false);
          }
        }}
      />
    </div>
  );
}
