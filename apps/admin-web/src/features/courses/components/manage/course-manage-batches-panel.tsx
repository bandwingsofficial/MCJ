"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Pencil, Plus } from "lucide-react";

import { Card } from "@/src/shared/components/ui/card";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { SearchInput } from "@/src/shared/components/ui/search-input";
import { AppSelect } from "@/src/shared/components/ui/select";
import { appToast } from "@/src/shared/components/ui/toast";

import { BatchModeBadge } from "@/src/features/batches/components/BatchModeBadge";
import { BatchStatusBadge } from "@/src/features/batches/components/BatchStatusBadge";
import { FILTER_BATCH_MODES } from "@/src/features/batches/constants/batch.constants";
import { batchService } from "@/src/features/batches/services/batch.service";
import type {
  Batch,
  BatchFilterStatus,
  BatchMode,
} from "@/src/features/batches/types/batch.types";
import {
  applyBatchStatusFilter,
  getBatchStatusFilterValue,
  parseBatchListResponse,
  type BatchStatusFilterValue,
} from "@/src/features/batches/utils/batch-list.utils";
import { formatBatchPrice } from "@/src/features/batches/utils/batch-pricing.util";
import {
  formatBatchDateRange,
  formatBatchTiming,
} from "@/src/features/batches/utils/batch.helper";
import {
  BATCH_SELECT_ALL,
  getBatchDisplayStatus,
  uniqueSelectOptions,
} from "@/src/features/batches/utils/batch-select.utils";
import { getErrorMessage } from "@/src/core/utils/get-error-message";
import { cn } from "@/src/shared/lib/cn";

interface Props {
  courseId: string;
}

export function CourseManageBatchesPanel({ courseId }: Props) {
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<BatchMode | undefined>(undefined);
  const [status, setStatus] = useState<BatchFilterStatus | undefined>(
    undefined,
  );
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const statusFilterValue = getBatchStatusFilterValue({ status });

  const modeOptions = useMemo(
    () =>
      uniqueSelectOptions([
        { label: "All Learning Modes", value: BATCH_SELECT_ALL },
        ...FILTER_BATCH_MODES,
      ]),
    [],
  );

  const statusOptions = useMemo(
    () =>
      uniqueSelectOptions([
        { label: "All Status", value: BATCH_SELECT_ALL },
        { label: "Active", value: "ACTIVE" },
        { label: "Inactive", value: "INACTIVE" },
        { label: "Archived", value: "ARCHIVED" },
      ]),
    [],
  );

  const loadBatches = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await batchService.getBatches({
        courseId,
        search: search.trim() || undefined,
        mode,
        ...applyBatchStatusFilter({}, statusFilterValue),
        includeDeleted: status === "ARCHIVED" ? true : false,
        page: 1,
        pageSize: 100,
      });
      const payload = parseBatchListResponse(response.data);
      setBatches(payload.items);
    } catch (error) {
      appToast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [courseId, search, mode, status, statusFilterValue]);

  useEffect(() => {
    void loadBatches();
  }, [loadBatches]);

  return (
    <Card className="rounded-xl border border-slate-200 p-4 shadow-sm">
      <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="w-full sm:min-w-[200px] sm:flex-1 sm:max-w-xs">
            <SearchInput
              value={search}
              placeholder="Search batches..."
              onChange={setSearch}
            />
          </div>

          <div className="w-full sm:w-[200px]">
            <AppSelect
              value={mode ?? BATCH_SELECT_ALL}
              triggerClassName="h-10 rounded-lg px-3 text-sm"
              onValueChange={(value) =>
                setMode(
                  value === BATCH_SELECT_ALL
                    ? undefined
                    : (value as BatchMode),
                )
              }
              options={modeOptions}
            />
          </div>

          <div className="w-full sm:w-[160px]">
            <AppSelect
              value={statusFilterValue}
              triggerClassName="h-10 rounded-lg px-3 text-sm"
              onValueChange={(value) => {
                const next = applyBatchStatusFilter(
                  {},
                  value as BatchStatusFilterValue | typeof BATCH_SELECT_ALL,
                );
                setStatus(next.status);
              }}
              options={statusOptions}
            />
          </div>
        </div>

        <Link
          href="/batches/create"
          className="inline-flex h-9 shrink-0 items-center rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Create Batch
        </Link>
      </div>

      {isLoading ? (
        <p className="py-8 text-center text-sm text-[#647A9B]">
          Loading batches...
        </p>
      ) : batches.length === 0 ? (
        <EmptyState
          title="No batches for this course"
          description="Create a batch linked to this course to schedule live classes."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[960px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Batch
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Mode
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Branch
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Schedule
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Enrollment
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {batches.map((batch) => {
                const displayStatus = getBatchDisplayStatus(batch);
                const isLifecycleBlocked =
                  displayStatus.key === "COMPLETED" ||
                  displayStatus.key === "EXPIRED" ||
                  displayStatus.key === "CANCELLED" ||
                  displayStatus.key === "ARCHIVED";

                return (
                  <tr
                    key={batch.id}
                    className={cn(
                      isLifecycleBlocked
                        ? "bg-slate-100/80 text-slate-500"
                        : "hover:bg-slate-50",
                    )}
                  >
                    <td className="px-4 py-3">
                      <p
                        className={cn(
                          "truncate text-sm font-medium",
                          isLifecycleBlocked
                            ? "text-slate-500"
                            : "text-[#102A56]",
                        )}
                      >
                        {batch.name}
                      </p>
                      {batch.code ? (
                        <p className="truncate font-mono text-xs text-slate-500">
                          {batch.code}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <BatchModeBadge mode={batch.mode} />
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3 text-sm tabular-nums",
                        isLifecycleBlocked
                          ? "text-slate-400"
                          : "text-slate-700",
                      )}
                    >
                      {formatBatchPrice(batch)}
                    </td>
                    <td
                      className={cn(
                        "truncate px-4 py-3 text-sm",
                        isLifecycleBlocked
                          ? "text-slate-400"
                          : "text-slate-700",
                      )}
                    >
                      {batch.branch?.branchName ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex min-w-0 flex-col gap-0.5 leading-snug">
                        <span
                          className={cn(
                            "truncate whitespace-nowrap text-sm",
                            isLifecycleBlocked
                              ? "text-slate-500"
                              : "text-[#102A56]",
                          )}
                        >
                          {formatBatchDateRange(
                            batch.startDate,
                            batch.endDate,
                          )}
                        </span>
                        <span
                          className={cn(
                            "truncate whitespace-nowrap text-sm",
                            isLifecycleBlocked
                              ? "text-slate-400"
                              : "text-slate-600",
                          )}
                        >
                          {formatBatchTiming(
                            batch.startTime,
                            batch.endTime,
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <BatchStatusBadge
                        displayStatus={displayStatus}
                        status={batch.status}
                        isActive={batch.isActive}
                        isDeleted={Boolean(
                          batch.isDeleted || batch.deletedAt,
                        )}
                        startDate={batch.startDate}
                        endDate={batch.endDate}
                      />
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3 text-sm tabular-nums",
                        isLifecycleBlocked
                          ? "text-slate-400"
                          : "text-slate-700",
                      )}
                    >
                      {batch.enrolledCount}/{batch.capacity}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center justify-end gap-2">
                        <Link
                          href={`/batches/${batch.id}/manage`}
                          className="inline-flex items-center gap-1 text-sm font-medium text-[#2563EB] hover:underline"
                        >
                          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                          Manage
                        </Link>
                        <Link
                          href={`/batches/${batch.id}/manage`}
                          className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:underline"
                          title="Edit in manage workspace"
                        >
                          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
