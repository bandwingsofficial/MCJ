"use client";

import Link from "next/link";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Loader } from "@/src/shared/components/ui/loader";
import { useAsyncData } from "@/src/shared/hooks/use-async-data";

interface Props {
  batchId: string;
}

export function BatchTimingReportsPanel({ batchId }: Props) {
  const { data, loading, error, reload } = useAsyncData(
    () => branchOpsApi.batchAttendanceSummary(batchId),
    [batchId],
  );

  if (loading) return <Loader />;
  if (error) return <ErrorState description={error} onRetry={reload} />;
  if (!data) return <EmptyState title="Unable to load reports." />;

  const { overview } = data;

  return (
    <div className="space-y-4 rounded-2xl border border-[#E1EBF5] bg-white p-5">
      <div>
        <h3 className="text-sm font-semibold text-[#102A56]">Attendance summary</h3>
        <p className="mt-1 text-sm text-[#647A9B]">
          Batch-level attendance overview for this timing&apos;s parent batch.
        </p>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-xs text-[#647A9B]">Present</dt>
          <dd className="mt-0.5 text-lg font-semibold text-[#102A56]">
            {overview.present}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-[#647A9B]">Absent</dt>
          <dd className="mt-0.5 text-lg font-semibold text-[#102A56]">
            {overview.absent}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-[#647A9B]">Late</dt>
          <dd className="mt-0.5 text-lg font-semibold text-[#102A56]">
            {overview.late}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-[#647A9B]">Overall %</dt>
          <dd className="mt-0.5 text-lg font-semibold text-[#102A56]">
            {overview.averageAttendance ?? 0}%
          </dd>
        </div>
      </dl>

      <Link
        href={`/attendance?batchId=${batchId}`}
        className="inline-flex text-sm font-medium text-[#2563EB] hover:underline"
      >
        Open full attendance reports
      </Link>
    </div>
  );
}
