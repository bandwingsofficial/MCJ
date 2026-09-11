"use client";

import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";

import { batchApi } from "@/src/features/batches/api/batch.api";
import { BatchCalendarDateDialog } from "@/src/features/batches/components/manage/calendar/batch-calendar-date-dialog";
import { BatchCalendarPageHeader } from "@/src/features/batches/components/manage/calendar/batch-calendar-page-header";
import { BatchCalendarSummaryPanel } from "@/src/features/batches/components/manage/calendar/batch-calendar-summary-panel";
import { BatchModeCalendarView } from "@/src/features/batches/components/manage/calendar/batch-mode-calendar-view";
import type { BatchCalendarViewResponse } from "@/src/features/batches/types/batch.types";
import { parseBatchModeParam } from "@/src/features/batches/utils/batch-manage.routes";
import {
  currentCalendarMonthKey,
  initialCalendarMonthKey,
} from "@/src/features/batches/utils/batch-calendar-display.utils";
import { BatchManageEmptyState } from "@/src/features/batches/components/manage/batch-manage-section";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Loader } from "@/src/shared/components/ui/loader";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

interface Props {
  batchId: string;
  modeParam: string;
}

export function BatchModeCalendarPage({ batchId, modeParam }: Props) {
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

    batchApi
      .getBatchCalendarView(batchId, mode, monthKey ? { month: monthKey } : undefined)
      .then((response) => {
        if (cancelled) return;
        setData(response.data);
        if (!monthKey) {
          setMonthKey(
            initialCalendarMonthKey(response.data.batch.startDate) ||
              response.data.monthKey,
          );
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(getErrorMessage(err));
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
    return (
      <ErrorState
        title="Invalid Learning Mode"
        description="The calendar route must include a valid learning mode: offline, online, or recorded."
      />
    );
  }

  if (loading && !data) {
    return (
      <div className="mx-auto min-h-full max-w-6xl space-y-4 px-4 py-5 sm:px-6">
        <Loader />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="mx-auto min-h-full max-w-6xl space-y-4 px-4 py-5 sm:px-6">
        <ErrorState
          title="Unable to Load Calendar"
          description={error}
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto min-h-full max-w-6xl space-y-4 px-4 py-5 sm:px-6">
        <BatchManageEmptyState
          icon={CalendarDays}
          title="Calendar Not Available"
          description="No calendar data could be loaded for this batch and learning mode."
        />
      </div>
    );
  }

  const reloadMonth = async (nextMonthKey: string) => {
    setLoading(true);
    try {
      const response = await batchApi.getBatchCalendarView(batchId, mode, {
        month: nextMonthKey,
      });
      setData(response.data);
      setMonthKey(response.data.monthKey);
    } catch (err: unknown) {
      appToast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto min-h-full max-w-6xl space-y-4 px-4 py-5 sm:px-6">
      <BatchCalendarPageHeader
        batchId={batchId}
        batchName={data.batch.name}
        batchCode={data.batch.code}
        mode={data.mode}
        modeLabel={data.modeLabel}
        scheduleLabel={data.scheduleLabel}
        startDate={data.batch.startDate}
        endDate={data.batch.endDate}
      />

      <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
        <div className="min-w-0 flex-1">
          <BatchModeCalendarView
            monthLabel={data.monthLabel}
            days={data.days}
            loading={loading}
            selectedDateKey={selectedDateKey}
            onSelectDate={setSelectedDateKey}
            onPreviousMonth={() => reloadMonth(data.previousMonthKey)}
            onNextMonth={() => reloadMonth(data.nextMonthKey)}
            showToday={data.monthKey !== currentCalendarMonthKey()}
            onToday={() => reloadMonth(currentCalendarMonthKey())}
          />
        </div>

        <aside className="min-w-0 xl:w-[22rem] xl:shrink-0">
          <BatchCalendarSummaryPanel
            summary={data.summary}
            modeLabel={data.modeLabel}
          />
        </aside>
      </div>

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
            const response = await batchApi.upsertBatchCalendarException(
              batchId,
              mode,
              {
                date: selectedDateKey,
                status: payload.status,
                reason: payload.reason,
              },
            );
            const result = response.data;
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
            appToast.error(getErrorMessage(err));
          } finally {
            setSaving(false);
          }
        }}
        onRestoreDefault={async () => {
          if (!selectedDateKey) return;
          setSaving(true);
          try {
            const response = await batchApi.deleteBatchCalendarException(
              batchId,
              mode,
              selectedDateKey,
            );
            const result = response.data;
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
            appToast.error(getErrorMessage(err));
          } finally {
            setSaving(false);
          }
        }}
      />
    </div>
  );
}
