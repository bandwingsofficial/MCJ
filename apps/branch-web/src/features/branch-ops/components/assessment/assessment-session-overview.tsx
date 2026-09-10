"use client";

import { useEffect, useMemo, useState } from "react";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import type {
  AssessmentItem,
  AttendanceSessionOption,
  BatchListItem,
} from "@/src/features/branch-ops/types";
import { formatAttendanceDisplayDate } from "@/src/features/branch-ops/utils/attendance-date.utils";
import { Badge } from "@/src/shared/components/ui/badge";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { AppSelect } from "@/src/shared/components/ui/select";
import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";

interface Props {
  batches: BatchListItem[];
  initialBatchId?: string;
  initialSessionId?: string;
  dateFrom?: string;
  dateTo?: string;
}

const FILTER_TRIGGER =
  "h-9 rounded-lg px-2.5 text-sm w-full min-w-0 [&>span]:line-clamp-1 [&>span]:text-left";

const compactBadgeClass = "px-2 py-0 text-[11px] font-semibold leading-5";

type GroupedAssessment = {
  assessmentGroupId: string | null;
  type: string;
  name: string;
  date: string;
  maxMarks: number;
  records: AssessmentItem[];
  summary: {
    totalStudents: number;
    averageMarks: number;
    averagePercentage: number;
    highestMarks: number;
    lowestMarks: number;
  };
};

function groupAssessments(items: AssessmentItem[]): GroupedAssessment[] {
  const map = new Map<string, AssessmentItem[]>();

  for (const item of items) {
    const key =
      item.assessmentGroupId ??
      `legacy:${item.id}:${item.type}:${item.name}:${String(item.date)}:${item.maxMarks}`;
    const list = map.get(key) ?? [];
    list.push(item);
    map.set(key, list);
  }

  return Array.from(map.entries()).map(([key, records]) => {
    const first = records[0];
    const obtained = records.map((row) => row.obtainedMarks);
    const sum = obtained.reduce((acc, value) => acc + value, 0);
    const percentages = records.map((row) => row.percentage);

    return {
      assessmentGroupId: first.assessmentGroupId,
      type: first.type,
      name: first.name,
      date: String(first.date),
      maxMarks: first.maxMarks,
      records,
      summary: {
        totalStudents: records.length,
        averageMarks: Math.round((sum / records.length) * 100) / 100,
        averagePercentage:
          Math.round(
            (percentages.reduce((acc, value) => acc + value, 0) /
              percentages.length) *
              10,
          ) / 10,
        highestMarks: Math.max(...obtained),
        lowestMarks: Math.min(...obtained),
      },
    };
  });
}

export function AssessmentSessionOverview({
  batches,
  initialBatchId,
  initialSessionId,
  dateFrom,
  dateTo,
}: Props) {
  const [batchId, setBatchId] = useState(initialBatchId ?? "");
  const [batchCourseId, setBatchCourseId] = useState(initialSessionId ?? "");
  const [sessions, setSessions] = useState<AttendanceSessionOption[]>([]);
  const [items, setItems] = useState<AssessmentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialBatchId) setBatchId(initialBatchId);
  }, [initialBatchId]);

  useEffect(() => {
    if (initialSessionId) setBatchCourseId(initialSessionId);
  }, [initialSessionId]);

  useEffect(() => {
    if (!batchId) {
      setSessions([]);
      setBatchCourseId("");
      return;
    }
    let cancelled = false;
    branchOpsApi
      .batchSessions(batchId)
      .then((result) => {
        if (!cancelled) setSessions(result);
      })
      .catch(() => {
        if (!cancelled) setSessions([]);
      });
    return () => {
      cancelled = true;
    };
  }, [batchId]);

  useEffect(() => {
    if (!batchId || !batchCourseId) {
      setItems([]);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    branchOpsApi
      .assessmentList({
        batchId,
        batchCourseId,
        from: dateFrom,
        to: dateTo,
      })
      .then((result) => {
        if (!cancelled) setItems(result);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err && typeof err === "object" && "response" in err
            ? (err as { response?: { data?: { message?: string } } }).response
                ?.data?.message
            : null;
        setError(message ?? "Unable to load session assessments.");
        setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [batchId, batchCourseId, dateFrom, dateTo]);

  const grouped = useMemo(() => groupAssessments(items), [items]);
  const selectedSession = sessions.find(
    (session) => session.batchCourseId === batchCourseId,
  );

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-[#E1EBF5] bg-white p-3 shadow-sm">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="min-w-0">
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

          <div className="min-w-0">
            <label className="mb-1 block text-xs font-semibold text-[#647A9B]">
              Session
            </label>
            <AppSelect
              value={batchCourseId || undefined}
              triggerClassName={FILTER_TRIGGER}
              placeholder="Select session"
              onValueChange={setBatchCourseId}
              disabled={!batchId}
              options={sessions.map((session) => ({
                label: session.label,
                value: session.batchCourseId,
              }))}
            />
          </div>
        </div>
      </div>

      {!batchId || !batchCourseId ? (
        <div className="overflow-hidden rounded-xl border border-[#E1EBF5] bg-white p-0 shadow-sm">
          <div className="flex min-h-[120px] flex-col items-center justify-center px-4 py-6 text-center">
            <h3 className="text-base font-semibold text-[#102A56]">
              Select Batch and Session
            </h3>
            <p className="mt-1 max-w-md text-sm text-[#647A9B]">
              Select a batch and session to view assessments.
            </p>
          </div>
        </div>
      ) : loading ? (
        <div className="overflow-hidden rounded-xl border border-[#E1EBF5] bg-white p-0 shadow-sm">
          <SkeletonTable rows={8} />
        </div>
      ) : error ? (
        <div className="overflow-hidden rounded-xl border border-[#E1EBF5] bg-white p-0 shadow-sm">
          <div className="p-3">
            <ErrorState description={error} />
          </div>
        </div>
      ) : !grouped.length ? (
        <div className="overflow-hidden rounded-xl border border-[#E1EBF5] bg-white p-0 shadow-sm">
          <div className="flex min-h-[120px] flex-col items-center justify-center px-4 py-6 text-center">
            <h3 className="text-base font-semibold">No Assessments Found</h3>
            <p className="mt-1 max-w-md text-sm text-[#647A9B]">
              No assessments found for this session.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {selectedSession ? (
            <p className="px-1 text-xs font-medium text-[#647A9B]">
              {selectedSession.label}
            </p>
          ) : null}

          {grouped.map((assessment) => (
            <div
              key={
                assessment.assessmentGroupId ??
                `${assessment.type}-${assessment.name}-${assessment.date}`
              }
              className="overflow-hidden rounded-xl border border-[#E1EBF5] bg-white shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] px-3 py-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#102A56]">
                    {assessment.name}
                  </p>
                  <p className="text-xs text-[#647A9B]">
                    {formatAttendanceDisplayDate(assessment.date)} · Max{" "}
                    {assessment.maxMarks}
                  </p>
                </div>
                <Badge variant="default" className={compactBadgeClass}>
                  {assessment.type}
                </Badge>
              </div>

              <div className="grid gap-2 border-b border-[#D9E4F2] px-3 py-2 text-xs text-[#647A9B] sm:grid-cols-2 lg:grid-cols-5">
                <span>Students: {assessment.summary.totalStudents}</span>
                <span>Avg Marks: {assessment.summary.averageMarks}</span>
                <span>Avg %: {assessment.summary.averagePercentage}%</span>
                <span>Highest: {assessment.summary.highestMarks}</span>
                <span>Lowest: {assessment.summary.lowestMarks}</span>
              </div>

              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-full border-collapse text-sm">
                  <thead className="border-b border-[#D9E4F2] bg-white text-[#526581]">
                    <tr>
                      <th className="!px-4 !py-3 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
                        Student
                      </th>
                      <th className="!px-4 !py-3 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
                        Code
                      </th>
                      <th className="!px-4 !py-3 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
                        Marks
                      </th>
                      <th className="!px-4 !py-3 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
                        %
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {assessment.records.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-slate-100 bg-white transition-colors hover:bg-slate-50"
                      >
                        <td className="!px-4 !py-3 align-middle text-sm font-medium leading-snug text-[#102A56]">
                          {row.student.name}
                        </td>
                        <td className="!px-4 !py-3 align-middle text-sm text-slate-700">
                          {row.student.studentCode}
                        </td>
                        <td className="!px-4 !py-3 align-middle text-sm tabular-nums text-slate-700">
                          {row.obtainedMarks} / {row.maxMarks}
                        </td>
                        <td className="!px-4 !py-3 align-middle text-sm tabular-nums text-slate-700">
                          {row.percentage}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
