"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import type { BatchListItem } from "@/src/features/branch-ops/types";
import {
  getBatchModeSectionLabel,
  getConfiguredBatchModes,
  getTimingsForMode,
  type BatchMode,
} from "@/src/features/branch-ops/utils/batch-mode.utils";
import {
  BLOCKED_BATCH_SELECTION_MESSAGE,
  isBatchSelectableForAssignment,
} from "@/src/features/branch-ops/utils/batch-selection.utils";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { SearchInput } from "@/src/shared/components/ui/search-input";
import { AppSelect } from "@/src/shared/components/ui/select";
import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";
import { Tooltip } from "@/src/shared/components/ui/tooltip";

interface Props {
  batches: BatchListItem[];
  reloadKey?: number;
}

const FILTER_TRIGGER =
  "h-9 rounded-lg px-2.5 text-sm w-full min-w-0 [&>span]:line-clamp-1 [&>span]:text-left";

const iconButtonClass =
  "inline-flex h-5 w-5 shrink-0 items-center justify-center border-0 bg-transparent p-0 leading-none transition-colors hover:opacity-80";

const iconClass = "h-[15px] w-[14px] stroke-[2]";

function studentAssessmentDetailPath(
  batchId: string,
  timingId: string,
  studentId: string,
) {
  return `/assessments/progress/${batchId}/${timingId}/${studentId}`;
}

export function AssessmentProgressPanel({ batches, reloadKey = 0 }: Props) {
  const router = useRouter();
  const [batchId, setBatchId] = useState("");
  const [mode, setMode] = useState<BatchMode | "">("");
  const [batchTimingId, setBatchTimingId] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [data, setData] =
    useState<Awaited<
      ReturnType<typeof branchOpsApi.batchTimingAssessmentProgress>
    > | null>(null);

  const selectableBatches = useMemo(
    () => batches.filter((batch) => isBatchSelectableForAssignment(batch)),
    [batches],
  );

  const selectedBatch =
    selectableBatches.find((batch) => batch.id === batchId) ?? null;

  const modeOptions = useMemo(() => {
    if (!selectedBatch) return [];
    return getConfiguredBatchModes(selectedBatch).map((item) => ({
      label: getBatchModeSectionLabel(item),
      value: item,
    }));
  }, [selectedBatch]);

  const timingOptions = useMemo(() => {
    if (!selectedBatch || !mode) return [];
    return getTimingsForMode(selectedBatch, mode).map((timing) => ({
      label: timing.name,
      value: timing.id,
    }));
  }, [mode, selectedBatch]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setMode("");
    setBatchTimingId("");
  }, [batchId]);

  useEffect(() => {
    setBatchTimingId("");
  }, [mode]);

  useEffect(() => {
    if (!batchId || !batchTimingId) {
      setData(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    branchOpsApi
      .batchTimingAssessmentProgress(batchId, batchTimingId, {
        search: debouncedSearch || undefined,
      })
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load batch progress.",
          );
          setData(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [batchId, batchTimingId, debouncedSearch, reloadKey, retryKey]);

  const selectionComplete = Boolean(batchId && mode && batchTimingId);
  const columnCount = data
    ? 5 + data.assessmentTypes.length
    : 5;

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-[#E1EBF5] bg-white p-3 shadow-sm">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <div className="min-w-0">
            <label className="mb-1 block text-xs font-semibold text-[#647A9B]">
              Main Batch
            </label>
            <AppSelect
              value={batchId || undefined}
              triggerClassName={FILTER_TRIGGER}
              placeholder="Select main batch"
              onValueChange={setBatchId}
              options={selectableBatches.map((batch) => ({
                label: `${batch.name} (${batch.code})`,
                value: batch.id,
              }))}
            />
          </div>

          <div className="min-w-0">
            <label className="mb-1 block text-xs font-semibold text-[#647A9B]">
              Learning Mode
            </label>
            <AppSelect
              value={mode || undefined}
              triggerClassName={FILTER_TRIGGER}
              placeholder={batchId ? "Select learning mode" : "Select batch first"}
              onValueChange={(value) => setMode(value as BatchMode)}
              options={modeOptions}
              disabled={!batchId}
            />
          </div>

          <div className="min-w-0">
            <label className="mb-1 block text-xs font-semibold text-[#647A9B]">
              Batch Timing
            </label>
            <AppSelect
              value={batchTimingId || undefined}
              triggerClassName={FILTER_TRIGGER}
              placeholder={mode ? "Select batch timing" : "Select mode first"}
              onValueChange={setBatchTimingId}
              options={timingOptions}
              disabled={!mode}
            />
          </div>

          <div className="min-w-0">
            <label className="mb-1 block text-xs font-semibold text-[#647A9B]">
              Student Search
            </label>
            <SearchInput
              value={search}
              placeholder="Search student..."
              className="h-9 rounded-lg !py-1.5 pl-9 text-sm"
              onChange={setSearch}
            />
          </div>
        </div>

        {!selectableBatches.length ? (
          <p className="mt-2 text-xs text-amber-700">
            {BLOCKED_BATCH_SELECTION_MESSAGE}
          </p>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-xl border border-[#E1EBF5] bg-white p-0 shadow-sm">
        {!selectionComplete ? (
          <div className="flex min-h-[120px] flex-col items-center justify-center px-4 py-6 text-center">
            <h3 className="text-base font-semibold text-[#102A56]">
              Select Batch Details
            </h3>
            <p className="mt-1 max-w-md text-sm text-[#647A9B]">
              Select batch, learning mode, and batch timing to view progress.
            </p>
          </div>
        ) : loading && !data ? (
          <SkeletonTable rows={8} />
        ) : error && !data ? (
          <div className="p-3">
            <ErrorState
              description={error}
              onRetry={() => setRetryKey((value) => value + 1)}
            />
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-full border-collapse text-sm">
              <thead className="sticky top-0 z-10 border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] text-[#526581]">
                <tr>
                  <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
                    Student ID
                  </th>
                  <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
                    Student Name
                  </th>
                  {data?.assessmentTypes.map((assessmentType) => (
                    <th
                      key={assessmentType}
                      className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]"
                    >
                      {assessmentType}
                    </th>
                  ))}
                  <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
                    Total Assessments
                  </th>
                  <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
                    Overall Performance
                  </th>
                  <th className="w-[4.5rem] !px-8 !py-4 text-right text-[11px] font-semibold tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {!data?.students.length ? (
                  <tr>
                    <td
                      colSpan={columnCount}
                      className="!px-4 !py-4 align-middle"
                    >
                      <div className="flex min-h-[120px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 px-4 py-4 text-center">
                        <h3 className="text-base font-semibold">
                          No Students Found
                        </h3>
                        <p className="mt-1 max-w-md text-sm text-[#647A9B]">
                          No students found for this batch timing.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.students.map((row) => (
                    <tr
                      key={row.student.id}
                      className="border-b border-slate-100 bg-white transition-colors hover:bg-slate-50"
                    >
                      <td className="!px-4 !py-4 align-middle font-mono text-xs text-slate-700">
                        {row.student.studentCode}
                      </td>
                      <td className="!px-4 !py-4 align-middle text-sm font-medium leading-snug text-[#102A56]">
                        {row.student.name}
                      </td>
                      {data.assessmentTypes.map((assessmentType) => (
                        <td
                          key={`${row.student.id}-${assessmentType}`}
                          className="!px-4 !py-4 align-middle text-sm tabular-nums text-slate-700"
                        >
                          {row.countsByType[assessmentType] ?? 0}
                        </td>
                      ))}
                      <td className="!px-4 !py-4 align-middle text-sm tabular-nums text-slate-700">
                        {row.totalAssessments}
                      </td>
                      <td className="!px-4 !py-4 align-middle text-sm tabular-nums text-slate-700">
                        {row.overallPerformance != null
                          ? `${row.overallPerformance}%`
                          : "—"}
                      </td>
                      <td className="!px-8 !py-4 text-right align-middle">
                        <div className="flex items-center justify-end gap-2">
                          <Tooltip content="View">
                            <button
                              type="button"
                              className={`${iconButtonClass} text-blue-900`}
                              aria-label="View"
                              onClick={() =>
                                router.push(
                                  studentAssessmentDetailPath(
                                    batchId,
                                    batchTimingId,
                                    row.student.id,
                                  ),
                                )
                              }
                            >
                              <Eye className={iconClass} />
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
