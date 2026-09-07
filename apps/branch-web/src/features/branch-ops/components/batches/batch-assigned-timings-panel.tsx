"use client";

import Link from "next/link";
import { Settings2 } from "lucide-react";

import type { BatchListItem } from "@/src/features/branch-ops/types";
import {
  getBatchModeSectionLabel,
  getConfiguredBatchModes,
  getTimingsForMode,
  type BatchMode,
} from "@/src/features/branch-ops/utils/batch-mode.utils";
import {
  formatBatchDate,
  formatBatchStatus,
  formatTimingDays,
  formatBatchTiming,
  statusBadgeVariant,
} from "@/src/features/branch-ops/utils/batch-display";
import { batchTimingManagePath } from "@/src/features/branch-ops/utils/batch-manage.routes";
import { Badge } from "@/src/shared/components/ui/badge";
import { Card } from "@/src/shared/components/ui/card";

interface Props {
  batch: BatchListItem;
  variant?: "manage" | "details";
}

function TimingsTable({
  batch,
  mode,
  variant = "manage",
}: {
  batch: BatchListItem;
  mode: BatchMode;
  variant?: "manage" | "details";
}) {
  const timings = getTimingsForMode(batch, mode);

  if (timings.length === 0) {
    return (
      <p className="text-sm text-[#647A9B]">
        No {getBatchModeSectionLabel(mode).toLowerCase()} timings are assigned
        to this batch.
      </p>
    );
  }

  if (variant === "details") {
    return (
      <div className="w-full min-w-0 overflow-x-auto">
        <table className="w-full min-w-[40rem] table-fixed border-collapse">
          <colgroup>
            <col className="w-[24%]" />
            <col className="w-[22%]" />
            <col className="w-[22%]" />
            <col className="w-[32%]" />
          </colgroup>
          <thead className="border-b border-slate-200 bg-[#F6F9FD]">
            <tr>
              {[
                "Batch timing name",
                "Start date – end date",
                "Days",
                "Start time – end time",
              ].map((label) => (
                <th
                  key={label}
                  className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {timings.map((timing) => (
              <tr
                key={timing.id}
                className="border-b border-slate-100 bg-white transition-colors hover:bg-slate-50"
              >
                <td className="min-w-0 truncate px-3 py-2.5 align-middle text-sm font-medium text-[#102A56]">
                  {timing.name}
                </td>
                <td className="min-w-0 truncate px-3 py-2.5 align-middle text-sm text-slate-700">
                  {formatBatchDate(timing.startDate)} –{" "}
                  {formatBatchDate(timing.endDate)}
                </td>
                <td className="min-w-0 truncate px-3 py-2.5 align-middle text-sm text-slate-700">
                  {formatTimingDays(timing.daysOfWeek)}
                </td>
                <td className="min-w-0 truncate px-3 py-2.5 align-middle text-sm text-slate-700">
                  {formatBatchTiming(timing.startTime, timing.endTime)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 overflow-x-auto">
      <table className="w-full min-w-[44rem] table-fixed border-collapse">
        <colgroup>
          <col className="w-[22%]" />
          <col />
          <col className="w-[6.5rem]" />
          <col className="w-[6.5rem]" />
          <col className="w-[6.5rem]" />
          <col className="w-[6.5rem]" />
          <col className="w-[4.5rem]" />
        </colgroup>
        <thead className="border-b border-slate-200 bg-[#F6F9FD]">
          <tr>
            {[
              "Batch Timing",
              "Schedule",
              "Capacity",
              "Enrolled",
              "Available",
              "Status",
              "Manage",
            ].map((label) => (
              <th
                key={label}
                className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 last:text-center"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {timings.map((timing) => (
            <tr
              key={timing.id}
              className="border-b border-slate-100 bg-white transition-colors hover:bg-slate-50"
            >
              <td className="min-w-0 truncate px-3 py-3 align-middle text-sm font-medium text-[#102A56]">
                {timing.name}
              </td>
              <td className="min-w-0 overflow-hidden px-3 py-3 align-middle text-sm text-slate-700">
                <div className="flex min-w-0 flex-col gap-0.5 leading-snug">
                  <span className="truncate">
                    {formatTimingDays(timing.daysOfWeek)} ·{" "}
                    {formatBatchTiming(timing.startTime, timing.endTime)}
                  </span>
                  <span className="truncate text-xs text-slate-500">
                    {formatBatchDate(timing.startDate)} –{" "}
                    {formatBatchDate(timing.endDate)}
                  </span>
                </div>
              </td>
              <td className="px-3 py-3 align-middle text-sm text-slate-700">
                {timing.capacity}
              </td>
              <td className="px-3 py-3 align-middle text-sm text-slate-700">
                {timing.enrolledStudents}
              </td>
              <td className="px-3 py-3 align-middle text-sm text-slate-700">
                {timing.availableSeats}
              </td>
              <td className="px-3 py-3 align-middle">
                <Badge variant={statusBadgeVariant(timing.status)}>
                  {formatBatchStatus(timing.status)}
                </Badge>
              </td>
              <td className="px-1.5 py-3 align-middle">
                <div className="flex items-center justify-center">
                  <Link
                    href={batchTimingManagePath(batch.id, timing.id)}
                    aria-label={`Manage ${timing.name}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#2563EB] transition-colors hover:bg-blue-50 hover:text-[#1E3A8A]"
                  >
                    <Settings2 className="h-5 w-5" />
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function BatchAssignedTimingsPanel({
  batch,
  variant = "manage",
}: Props) {
  const modes = getConfiguredBatchModes(batch);

  if (modes.length === 0) {
    return (
      <p className="text-sm text-[#647A9B]">
        No assigned batch timings are linked to this batch.
      </p>
    );
  }

  return (
    <div className={variant === "details" ? "space-y-3" : "space-y-4"}>
      {modes.map((mode) => (
        <Card
          key={mode}
          className="overflow-hidden rounded-2xl border-[#E1EBF5] p-0 shadow-[0_2px_10px_rgba(16,42,86,0.04)]"
        >
          <div className="border-b border-[#E1EBF5] px-5 py-3">
            <h3 className="text-sm font-semibold text-[#102A56]">
              {getBatchModeSectionLabel(mode)}
            </h3>
          </div>
          <div className={variant === "details" ? "p-4" : "p-5"}>
            <TimingsTable batch={batch} mode={mode} variant={variant} />
          </div>
        </Card>
      ))}
    </div>
  );
}
