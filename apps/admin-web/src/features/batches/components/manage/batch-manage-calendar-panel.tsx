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
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import {
  BatchManageEmptyMessage,
  BatchManageSection,
} from "./batch-manage-section";

interface Props {
  batchId: string;
}

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
    return <ErrorState description={error} />;
  }

  const items = data?.items ?? [];

  return (
    <BatchManageSection
      title="Calendar Management"
      description="Working-day calendars are maintained separately for each configured learning mode."
    >
      {items.length === 0 ? (
        <BatchManageEmptyMessage message="No learning modes are configured for this batch yet." />
      ) : (
        <div className="w-full min-w-0 overflow-x-auto">
          <table className="w-full min-w-[56rem] table-fixed border-collapse">
            <thead className="border-b border-slate-200 bg-[#F6F9FD]">
              <tr>
                {[
                  "Learning Mode",
                  "Working Days",
                  "Start Date",
                  "End Date",
                  "Working Days",
                  "Non-Working Days",
                  "Holidays",
                  "Calendar",
                ].map((label, index) => (
                  <th
                    key={`${label}-${index}`}
                    className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.mode} className="border-b border-slate-100">
                  <td className="px-3 py-3 text-sm font-medium text-[#102A56]">
                    {row.modeLabel}
                  </td>
                  <td className="px-3 py-3 text-sm text-slate-600">
                    {row.scheduleLabel}
                  </td>
                  <td className="px-3 py-3 text-sm text-slate-600">
                    {formatBatchCalendarDate(row.startDate)}
                  </td>
                  <td className="px-3 py-3 text-sm text-slate-600">
                    {row.endDate ? formatBatchCalendarDate(row.endDate) : "—"}
                  </td>
                  <td className="px-3 py-3 text-sm text-slate-600">
                    {row.summary.workingDays}
                  </td>
                  <td className="px-3 py-3 text-sm text-slate-600">
                    {row.summary.nonWorkingDays}
                  </td>
                  <td className="px-3 py-3 text-sm text-slate-600">
                    {row.summary.holidays}
                  </td>
                  <td className="px-3 py-3">
                    <Link
                      href={batchCalendarPath(batchId, row.mode)}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-[#102A56] hover:border-[#2563EB] hover:text-[#2563EB]"
                    >
                      <CalendarDays className="h-4 w-4" />
                      View Calendar
                    </Link>
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
