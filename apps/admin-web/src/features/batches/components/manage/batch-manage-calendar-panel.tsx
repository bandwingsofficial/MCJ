"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays } from "lucide-react";

import { batchApi } from "@/src/features/batches/api/batch.api";
import type { BatchCalendarSummariesResponse } from "@/src/features/batches/types/batch.types";
import { batchCalendarPath } from "@/src/features/batches/utils/batch-manage.routes";
import { formatBatchCalendarDate } from "@/src/features/batches/utils/batch-calendar-display.utils";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Loader } from "@/src/shared/components/ui/loader";
import { Tooltip } from "@/src/shared/components/ui/tooltip";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import {
  BatchManageEmptyState,
  BatchManageSection,
} from "./batch-manage-section";

interface Props {
  batchId: string;
}

const TABLE_HEAD_CLASS =
  "px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#526581]";

const iconButtonClass =
  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E1EBF5] bg-white text-[#2563EB] transition-colors hover:border-[#2563EB] hover:bg-blue-50 hover:text-[#1E3A8A]";

export function BatchManageCalendarPanel({ batchId }: Props) {
  const [data, setData] = useState<BatchCalendarSummariesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    batchApi
      .getBatchCalendarSummaries(batchId)
      .then((response) => {
        if (!cancelled) setData(response.data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(getErrorMessage(err) || "Unable to load calendar summaries.");
          setData(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [batchId]);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <ErrorState
        title="Unable to Load Calendar"
        description={error}
      />
    );
  }

  const items = data?.items ?? [];

  return (
    <BatchManageSection
      title="Calendar Management"
      description="Working-day calendars are maintained separately for each configured learning mode."
    >
      {items.length === 0 ? (
        <BatchManageEmptyState
          icon={CalendarDays}
          title="No Calendars Configured"
          description="Configure batch timings first. Calendar data is tied to each learning mode for this parent batch."
        />
      ) : (
        <div className="w-full min-w-0 overflow-x-auto">
          <table className="w-full min-w-[56rem] table-fixed border-collapse">
            <thead className="border-b border-[#D9E4F2] bg-[#F6F9FD]">
              <tr>
                {[
                  "Learning Mode",
                  "Schedule Days",
                  "Start Date",
                  "End Date",
                  "Working Days",
                  "Non-Working Days",
                  "Holidays",
                  "Calendar",
                ].map((label) => (
                  <th key={label} className={TABLE_HEAD_CLASS}>
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((row) => (
                <tr
                  key={row.mode}
                  className="border-b border-slate-100 bg-white transition-colors hover:bg-[#F8FBFF]"
                >
                  <td className="px-3 py-3 text-sm font-medium text-[#102A56]">
                    {row.modeLabel}
                  </td>
                  <td className="px-3 py-3 text-sm text-slate-700">
                    {row.scheduleLabel}
                  </td>
                  <td className="px-3 py-3 text-sm text-slate-700">
                    {formatBatchCalendarDate(row.startDate)}
                  </td>
                  <td className="px-3 py-3 text-sm text-slate-700">
                    {row.endDate ? formatBatchCalendarDate(row.endDate) : "—"}
                  </td>
                  <td className="px-3 py-3 text-sm tabular-nums text-slate-700">
                    {row.summary.workingDays}
                  </td>
                  <td className="px-3 py-3 text-sm tabular-nums text-slate-700">
                    {row.summary.nonWorkingDays}
                  </td>
                  <td className="px-3 py-3 text-sm tabular-nums text-slate-700">
                    {row.summary.holidays}
                  </td>
                  <td className="px-3 py-3">
                    <Tooltip content={`View ${row.modeLabel} calendar`}>
                      <Link
                        href={batchCalendarPath(batchId, row.mode)}
                        aria-label={`View ${row.modeLabel} calendar`}
                        className={iconButtonClass}
                      >
                        <CalendarDays className="h-[1.25rem] w-[1.25rem]" />
                      </Link>
                    </Tooltip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </BatchManageSection>
  );
}
