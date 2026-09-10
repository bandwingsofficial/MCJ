"use client";

import Link from "next/link";

import { StudentAssessmentRecordsTab } from "@/src/features/branch-ops/components/students/student-assessment-records-tab";
import type {
  StudentAssessmentOverview,
  StudentAssessmentRecord,
  StudentTimingAssessmentDetail,
} from "@/src/features/branch-ops/types";
import { formatAttendanceDisplayDate } from "@/src/features/branch-ops/utils/attendance-date.utils";
import { getBatchModeSectionLabel } from "@/src/features/branch-ops/utils/batch-mode.utils";
import { formatBatchLabel } from "@/src/features/branch-ops/utils/batch-display";
import { Badge } from "@/src/shared/components/ui/badge";
import { Card } from "@/src/shared/components/ui/card";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/shared/components/ui/table";

function SummaryField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[120px]">
      <p className="text-xs text-[#647A9B]">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-[#102A56]">{value}</p>
    </div>
  );
}

function AssessmentRecordsTable({ records }: { records: StudentAssessmentRecord[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[#E1EBF5] bg-white">
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
          {records.map((record) => (
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
              <TableCell>
                {record.batchTiming?.mode
                  ? getBatchModeSectionLabel(
                      record.batchTiming.mode as "OFFLINE" | "ONLINE" | "RECORDED",
                    )
                  : "—"}
              </TableCell>
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
  );
}

function AssessmentSummaryCards({
  data,
}: {
  data: Pick<
    StudentAssessmentOverview,
    | "totalAssessments"
    | "countsByType"
    | "assessmentTypes"
    | "overallPerformance"
    | "summary"
  >;
}) {
  return (
    <div className="space-y-4">
      <Card className="rounded-2xl border border-[#E1EBF5] bg-white p-5">
        <h2 className="text-sm font-semibold text-[#102A56]">
          Assessment Performance Summary
        </h2>
        <div className="mt-4 flex flex-wrap items-start gap-x-8 gap-y-3">
          <SummaryField
            label="Total Assessments"
            value={String(data.totalAssessments)}
          />
          <SummaryField
            label="Overall Performance"
            value={
              data.totalAssessments > 0
                ? `${data.overallPerformance}%`
                : "—"
            }
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
      </Card>

      <Card className="rounded-2xl border border-[#E1EBF5] bg-white p-5">
        <h2 className="text-sm font-semibold text-[#102A56]">
          Assessment-wise Performance
        </h2>
        <div className="mt-3 flex flex-wrap gap-3">
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
    </div>
  );
}

export function StudentAssessmentRecordsPanel({
  data,
}: {
  data: StudentAssessmentOverview;
}) {
  return <StudentAssessmentRecordsTab data={data} />;
}

export function StudentAssessmentReportsPanel({
  data,
}: {
  data: StudentAssessmentOverview;
}) {
  if (!data.records.length) {
    return (
      <EmptyState title="No assessment reports available for this student's current enrollments." />
    );
  }

  return (
    <div className="space-y-4">
      <AssessmentSummaryCards data={data} />
      <Card className="rounded-2xl border border-[#E1EBF5] bg-white p-5">
        <h2 className="text-sm font-semibold text-[#102A56]">
          Complete Assessment History
        </h2>
        <p className="mt-1 text-sm text-[#647A9B]">
          All assessments from active enrollments, including Test, Presentation,
          and other assessment types.
        </p>
        <div className="mt-4">
          <AssessmentRecordsTable records={data.records} />
        </div>
      </Card>
    </div>
  );
}

export function EnrollmentAssessmentProgressPanel({
  data,
}: {
  data: StudentTimingAssessmentDetail;
}) {
  if (!data.records.length) {
    return (
      <EmptyState title="No assessment records found for this enrollment." />
    );
  }

  const overview: StudentAssessmentOverview = {
    studentId: data.student.id,
    records: data.records,
    assessmentTypes: data.assessmentTypes,
    countsByType: data.countsByType,
    totalAssessments: data.totalAssessments,
    overallPerformance: data.overallPerformance,
    summary: data.summary,
  };

  return (
    <div className="space-y-4">
      <Card className="grid gap-4 rounded-2xl border border-[#E1EBF5] bg-white p-5 sm:grid-cols-2 lg:grid-cols-3">
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
          value={
            data.timing?.mode
              ? getBatchModeSectionLabel(
                  data.timing.mode as "OFFLINE" | "ONLINE" | "RECORDED",
                )
              : "—"
          }
        />
        <SummaryField label="Batch Timing" value={data.timing?.name ?? "—"} />
        <SummaryField label="Course" value={data.course.title} />
        {data.timing ? (
          <div>
            <p className="text-xs text-[#647A9B]">Batch Progress View</p>
            <Link
              href={`/assessments/progress/${data.batch.id}/${data.timing.id}/${data.student.id}`}
              className="mt-0.5 inline-block text-sm font-medium text-[#2563EB] hover:underline"
            >
              Open detailed progress
            </Link>
          </div>
        ) : null}
      </Card>

      <AssessmentSummaryCards data={overview} />

      <Card className="rounded-2xl border border-[#E1EBF5] bg-white p-5">
        <h2 className="text-sm font-semibold text-[#102A56]">
          Assessment Records
        </h2>
        <div className="mt-4">
          <AssessmentRecordsTable records={data.records} />
        </div>
      </Card>
    </div>
  );
}
