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
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Loader } from "@/src/shared/components/ui/loader";
import { AppSelect } from "@/src/shared/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/shared/components/ui/table";

interface Props {
  batches: BatchListItem[];
  initialBatchId?: string;
  initialSessionId?: string;
  dateFrom?: string;
  dateTo?: string;
}

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
      .assessmentReport({
        batchId,
        batchCourseId,
        from: dateFrom,
        to: dateTo,
        take: 200,
        skip: 0,
      })
      .then(async (first) => {
        if (cancelled) return;
        const all = [...(first.items ?? [])];
        let skip = 200;
        while (skip < first.total) {
          const page = await branchOpsApi.assessmentReport({
            batchId,
            batchCourseId,
            from: dateFrom,
            to: dateTo,
            take: 200,
            skip,
          });
          all.push(...(page.items ?? []));
          skip += 200;
        }
        if (!cancelled) setItems(all);
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
    <div className="space-y-4">
      <div className="grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
            Batch
          </label>
          <AppSelect
            value={batchId || undefined}
            placeholder="Select batch"
            onValueChange={setBatchId}
            options={batches.map((batch) => ({
              label: `${batch.name} (${batch.code})`,
              value: batch.id,
            }))}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
            Session
          </label>
          <AppSelect
            value={batchCourseId || undefined}
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

      {!batchId || !batchCourseId ? (
        <EmptyState title="Select a batch and session to view assessments." />
      ) : loading ? (
        <Loader />
      ) : error ? (
        <ErrorState description={error} />
      ) : !grouped.length ? (
        <EmptyState title="No assessments found for this session." />
      ) : (
        <>
          <div>
            <h3 className="text-sm font-semibold text-[#102A56]">
              Session Assessments
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {selectedSession?.label ?? "Selected session"}
            </p>
          </div>

          <div className="space-y-4">
            {grouped.map((assessment) => (
              <div
                key={
                  assessment.assessmentGroupId ??
                  `${assessment.type}-${assessment.name}-${assessment.date}`
                }
                className="overflow-hidden rounded-xl border border-slate-200"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
                  <div>
                    <p className="font-medium text-[#102A56]">
                      {assessment.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatAttendanceDisplayDate(assessment.date)} · Max{" "}
                      {assessment.maxMarks}
                    </p>
                  </div>
                  <Badge variant="default">{assessment.type}</Badge>
                </div>

                <div className="grid gap-3 border-b border-slate-200 px-4 py-3 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-5">
                  <span>Students: {assessment.summary.totalStudents}</span>
                  <span>Avg Marks: {assessment.summary.averageMarks}</span>
                  <span>Avg %: {assessment.summary.averagePercentage}%</span>
                  <span>Highest: {assessment.summary.highestMarks}</span>
                  <span>Lowest: {assessment.summary.lowestMarks}</span>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Marks</TableHead>
                        <TableHead>%</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assessment.records.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="font-medium text-[#102A56]">
                            {row.student.name}
                          </TableCell>
                          <TableCell>{row.student.studentCode}</TableCell>
                          <TableCell>
                            {row.obtainedMarks} / {row.maxMarks}
                          </TableCell>
                          <TableCell>{row.percentage}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
