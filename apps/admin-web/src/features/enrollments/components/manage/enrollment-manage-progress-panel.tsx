"use client";

import { useCallback, useEffect, useState } from "react";

import { enrollmentService } from "@/src/features/enrollments/services/enrollment.service";
import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";
import type { EnrollmentAssessmentDetail } from "@/src/features/enrollments/types/enrollment-assessment.types";
import { formatEnrollmentOverviewContextLabel } from "@/src/features/enrollments/utils/enrollment-overview.utils";
import {
  formatAttendanceDisplayDate,
} from "@/src/features/enrollments/utils/attendance-date.utils";
import { Badge } from "@/src/shared/components/ui/badge";
import { Card } from "@/src/shared/components/ui/card";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
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
  enrollment: Enrollment;
}

function formatBatchLabel(name: string, code?: string | null) {
  return code ? `${name} (${code})` : name;
}

function formatMode(mode?: string | null) {
  if (!mode) return "—";
  return mode.charAt(0) + mode.slice(1).toLowerCase();
}

function SummaryField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[120px]">
      <p className="text-xs text-[#647A9B]">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-[#102A56]">{value}</p>
    </div>
  );
}

export function EnrollmentManageProgressPanel({ enrollment }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<EnrollmentAssessmentDetail | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await enrollmentService.getEnrollmentAssessments(
        enrollment.id,
      );
      setData(result.data);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load enrollment assessment progress.",
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [enrollment.id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading && !data) return <Loader />;
  if (error && !data) {
    return <ErrorState description={error} onRetry={load} />;
  }
  if (!data) {
    return <EmptyState title="Assessment progress is not available." />;
  }

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-[#102A56]">
          Assessment Progress
        </h2>
        <p className="mt-1 text-sm text-[#647A9B]">
          Assessment records for {enrollment.enrollmentNumber} (
          {formatEnrollmentOverviewContextLabel(enrollment)})
        </p>
      </Card>

      <Card className="grid gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:grid-cols-2 lg:grid-cols-3">
        <SummaryField
          label="Student"
          value={`${data.student.name} (${data.student.studentCode})`}
        />
        <SummaryField
          label="Batch"
          value={formatBatchLabel(data.batch.name, data.batch.code)}
        />
        <SummaryField
          label="Learning Mode"
          value={formatMode(data.timing?.mode)}
        />
        <SummaryField label="Batch Timing" value={data.timing?.name ?? "—"} />
        <SummaryField label="Course" value={data.course.title} />
        <SummaryField
          label="Overall Performance"
          value={
            data.totalAssessments > 0
              ? `${data.overallPerformance}%`
              : "—"
          }
        />
      </Card>

      <Card className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-[#102A56]">
          Assessment Performance Summary
        </h3>
        <div className="mt-4 flex flex-wrap items-start gap-x-8 gap-y-3">
          <SummaryField
            label="Total Assessments"
            value={String(data.totalAssessments)}
          />
          <SummaryField
            label="Average Marks"
            value={String(data.summary.averageMarks)}
          />
          <SummaryField
            label="Average Percentage"
            value={`${data.summary.averagePercentage}%`}
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          {data.assessmentTypes.length ? (
            data.assessmentTypes.map((type) => (
              <div
                key={type}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              >
                <span className="font-medium text-[#102A56]">{type}</span>
                <span className="ml-2 text-slate-600">
                  {data.countsByType[type] ?? 0}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-[#647A9B]">No assessments recorded yet.</p>
          )}
        </div>
      </Card>

      {!data.records.length ? (
        <EmptyState title="No assessment records found for this enrollment." />
      ) : (
        <Card className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h3 className="text-sm font-semibold text-[#102A56]">
              Assessment Records
            </h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Assessment Date</TableHead>
                  <TableHead>Assessment Name</TableHead>
                  <TableHead>Assessment Type</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Learning Mode</TableHead>
                  <TableHead>Batch Timing</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Maximum Marks</TableHead>
                  <TableHead>Obtained Marks</TableHead>
                  <TableHead>Percentage</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatAttendanceDisplayDate(String(record.date))}
                    </TableCell>
                    <TableCell className="min-w-[140px] font-medium text-[#102A56]">
                      {record.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">{record.type}</Badge>
                    </TableCell>
                    <TableCell className="min-w-[140px]">
                      {formatBatchLabel(record.batch.name, record.batch.code)}
                    </TableCell>
                    <TableCell>{formatMode(record.batchTiming?.mode)}</TableCell>
                    <TableCell>{record.batchTiming?.name ?? "—"}</TableCell>
                    <TableCell className="min-w-[120px]">
                      {record.course?.title ?? "—"}
                    </TableCell>
                    <TableCell>{record.maxMarks}</TableCell>
                    <TableCell>{record.obtainedMarks}</TableCell>
                    <TableCell>{record.percentage}%</TableCell>
                    <TableCell>{record.remarks ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
}
