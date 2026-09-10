"use client";

import { useEffect, useState } from "react";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import type {
  BatchAssessmentAnalytics,
  BatchListItem,
} from "@/src/features/branch-ops/types";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { AppSelect } from "@/src/shared/components/ui/select";
import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";

const TYPE_COLUMNS = [
  "TEST",
  "PRESENTATION",
  "ASSIGNMENT",
  "PRACTICAL",
  "OTHER",
] as const;

const FILTER_TRIGGER =
  "h-9 rounded-lg px-2.5 text-sm w-full min-w-0 [&>span]:line-clamp-1 [&>span]:text-left";

const COLUMN_COUNT = 3 + TYPE_COLUMNS.length + 1;

function formatTypeValue(value: number | null | undefined) {
  if (value == null) return "—";
  return `${value}%`;
}

interface Props {
  batches: BatchListItem[];
  initialBatchId?: string;
}

export function AssessmentBatchOverview({
  batches,
  initialBatchId,
}: Props) {
  const [batchId, setBatchId] = useState(initialBatchId ?? "");
  const [data, setData] = useState<BatchAssessmentAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialBatchId) setBatchId(initialBatchId);
  }, [initialBatchId]);

  useEffect(() => {
    if (!batchId) {
      setData(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    branchOpsApi
      .batchAssessmentSummary(batchId)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err && typeof err === "object" && "response" in err
            ? (err as { response?: { data?: { message?: string } } }).response
                ?.data?.message
            : null;
        setError(message ?? "Unable to load batch assessment overview.");
        setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [batchId]);

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-[#E1EBF5] bg-white p-3 shadow-sm">
        <div className="max-w-md">
          <label className="mb-1 block text-xs font-semibold text-[#647A9B]">
            Batch
          </label>
          <AppSelect
            value={batchId || undefined}
            triggerClassName={FILTER_TRIGGER}
            placeholder="Select batch"
            onValueChange={setBatchId}
            options={batches.map((batch) => ({
              label: `${batch.name} (${batch.code})`,
              value: batch.id,
            }))}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#E1EBF5] bg-white p-0 shadow-sm">
        {!batchId ? (
          <div className="flex min-h-[120px] flex-col items-center justify-center px-4 py-6 text-center">
            <h3 className="text-base font-semibold text-[#102A56]">
              Select a Batch
            </h3>
            <p className="mt-1 max-w-md text-sm text-[#647A9B]">
              Select a batch to view assessment overview.
            </p>
          </div>
        ) : loading ? (
          <SkeletonTable rows={8} />
        ) : error ? (
          <div className="p-3">
            <ErrorState description={error} />
          </div>
        ) : !data ? (
          <div className="flex min-h-[120px] flex-col items-center justify-center px-4 py-6 text-center">
            <h3 className="text-base font-semibold">No Batch Assessment Data</h3>
          </div>
        ) : (
          <>
            <p className="border-b border-[#D9E4F2] bg-[#F8FBFF] px-3 py-2 text-xs font-medium text-[#647A9B]">
              {data.batch.name} · {data.batch.code}
            </p>

            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-full border-collapse text-sm">
                <thead className="sticky top-0 z-10 border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] text-[#526581]">
                  <tr>
                    <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
                      Student
                    </th>
                    <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
                      Code
                    </th>
                    <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
                      Total Assessments
                    </th>
                    {TYPE_COLUMNS.map((type) => (
                      <th
                        key={type}
                        className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]"
                      >
                        {type}
                      </th>
                    ))}
                    <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
                      Average %
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {!data.students.length ? (
                    <tr>
                      <td
                        colSpan={COLUMN_COUNT}
                        className="!px-4 !py-4 align-middle"
                      >
                        <div className="flex min-h-[120px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 px-4 py-4 text-center">
                          <h3 className="text-base font-semibold">
                            No Students Found
                          </h3>
                          <p className="mt-1 max-w-md text-sm text-[#647A9B]">
                            No students enrolled in this batch.
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
                        <td className="!px-4 !py-4 align-middle text-sm font-medium leading-snug text-[#102A56]">
                          {row.student.name}
                        </td>
                        <td className="!px-4 !py-4 align-middle text-sm text-slate-700">
                          {row.student.studentCode}
                        </td>
                        <td className="!px-4 !py-4 align-middle text-sm tabular-nums text-slate-700">
                          {row.totalAssessments}
                        </td>
                        {TYPE_COLUMNS.map((type) => (
                          <td
                            key={type}
                            className="!px-4 !py-4 align-middle text-sm tabular-nums text-slate-700"
                          >
                            {formatTypeValue(row.byType[type])}
                          </td>
                        ))}
                        <td className="!px-4 !py-4 align-middle text-sm tabular-nums text-slate-700">
                          {formatTypeValue(row.averagePercentage)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
