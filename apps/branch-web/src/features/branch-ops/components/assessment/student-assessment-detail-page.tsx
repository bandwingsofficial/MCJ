"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import type { StudentTimingAssessmentDetail } from "@/src/features/branch-ops/types";
import { formatAttendanceDisplayDate } from "@/src/features/branch-ops/utils/attendance-date.utils";
import { getBatchModeSectionLabel } from "@/src/features/branch-ops/utils/batch-mode.utils";
import { Badge } from "@/src/shared/components/ui/badge";
import { Card } from "@/src/shared/components/ui/card";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Loader } from "@/src/shared/components/ui/loader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/shared/components/ui/table";

interface Props {
  batchId: string;
  timingId: string;
  studentId: string;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-medium text-[#102A56]">{value}</p>
    </div>
  );
}

export function StudentAssessmentDetailPage({
  batchId,
  timingId,
  studentId,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<StudentTimingAssessmentDetail | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    branchOpsApi
      .studentTimingAssessmentDetail(batchId, timingId, studentId)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load student assessment detail.",
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
  }, [batchId, timingId, studentId]);

  if (loading && !data) return <Loader />;
  if (error && !data) return <ErrorState description={error} />;
  if (!data) return <ErrorState description="Assessment detail not available." />;

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/assessments"
          className="inline-flex items-center gap-1 text-sm font-medium text-[#2563EB] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Assessments
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#102A56]">
          Student Assessment Progress
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Complete assessment history for this student in the selected batch
          timing.
        </p>
      </div>

      <Card className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Student" value={`${data.student.name} (${data.student.studentCode})`} />
        <Field label="Student Code" value={data.student.studentCode} />
        <Field label="Branch" value={data.branch.branchName} />
        <Field label="Batch" value={`${data.batch.name} (${data.batch.code})`} />
        <Field
          label="Learning Mode"
          value={getBatchModeSectionLabel(data.timing.mode)}
        />
        <Field label="Batch Timing" value={data.timing.name} />
        <Field label="Course" value={data.course.title} />
        <Field
          label="Overall Performance"
          value={
            data.totalAssessments > 0
              ? `${data.overallPerformance}%`
              : "—"
          }
        />
        <Field label="Total Assessments" value={String(data.totalAssessments)} />
      </Card>

      <Card className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Average Marks" value={String(data.summary.averageMarks)} />
        <Field
          label="Average Percentage"
          value={`${data.summary.averagePercentage}%`}
        />
        <Field label="Highest Marks" value={String(data.summary.highestMarks)} />
        <Field label="Lowest Marks" value={String(data.summary.lowestMarks)} />
        <Field label="Marks Entered" value={String(data.summary.marksEntered)} />
      </Card>

      <Card className="p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Assessment-wise Performance Summary
        </h2>
        <div className="mt-3 flex flex-wrap gap-3">
          {Object.entries(data.countsByType).map(([type, count]) => (
            <div
              key={type}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            >
              <span className="font-medium text-[#102A56]">{type}</span>
              <span className="ml-2 text-slate-600">{count}</span>
            </div>
          ))}
        </div>
      </Card>

      {data.groupedAssessments.map((group) => (
        <section key={group.type} className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-[#102A56]">
              {group.type} Assessments
            </h2>
            <Badge variant="default">{group.items.length}</Badge>
          </div>

          {!group.items.length ? (
            <Card className="border-dashed p-4 text-sm text-slate-500">
              No {group.type.toLowerCase()} assessments recorded.
            </Card>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Assessment</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Max Marks</TableHead>
                    <TableHead>Obtained Marks</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium text-[#102A56]">
                        {item.name}
                      </TableCell>
                      <TableCell>
                        {formatAttendanceDisplayDate(String(item.date))}
                      </TableCell>
                      <TableCell>{item.maxMarks}</TableCell>
                      <TableCell>{item.obtainedMarks}</TableCell>
                      <TableCell>{item.percentage}%</TableCell>
                      <TableCell>{item.remarks ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
