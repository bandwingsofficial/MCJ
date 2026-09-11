"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ClipboardList } from "lucide-react";

import { enrollmentService } from "@/src/features/enrollments/services/enrollment.service";
import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";
import type { EnrollmentAssessmentDetail } from "@/src/features/enrollments/types/enrollment-assessment.types";
import { formatEnrollmentOverviewContextLabel } from "@/src/features/enrollments/utils/enrollment-overview.utils";
import { formatAttendanceDisplayDate } from "@/src/features/enrollments/utils/attendance-date.utils";
import { BRANCH_TABLE_CARD_CLASS } from "@/src/features/branches/components/manage/branch-manage-layout.constants";
import { BranchManagePaginationFooter } from "@/src/features/branches/components/manage/branch-manage-pagination-footer";
import {
  BranchManageTableShell,
  TABLE_CELL_CLASS,
} from "@/src/features/branches/components/manage/branch-manage-table-shell";
import { Badge } from "@/src/shared/components/ui/badge";
import { Card } from "@/src/shared/components/ui/card";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Loader } from "@/src/shared/components/ui/loader";

interface Props {
  enrollment: Enrollment;
}

const RECORD_COLUMNS = [
  { key: "date", label: "Assessment Date" },
  { key: "name", label: "Assessment Name" },
  { key: "type", label: "Assessment Type" },
  { key: "max", label: "Maximum Marks" },
  { key: "obtained", label: "Obtained Marks" },
  { key: "percentage", label: "Percentage" },
  { key: "remarks", label: "Remarks" },
];

const DEFAULT_PAGE_SIZE = 10;

function formatBatchLabel(name: string, code?: string | null) {
  return code ? `${name} (${code})` : name;
}

function formatMode(mode?: string | null) {
  if (!mode) return "—";
  return mode.charAt(0) + mode.slice(1).toLowerCase();
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#E8F0FA] bg-gradient-to-br from-[#F8FBFF] to-white p-3 shadow-[0_1px_4px_rgba(16,42,86,0.04)]">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-[#102A56]">{value}</p>
    </div>
  );
}

export function EnrollmentManageProgressPanel({ enrollment }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<EnrollmentAssessmentDetail | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

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

  const records = data?.records ?? [];
  const total = records.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const from = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const to = total === 0 ? 0 : Math.min(safePage * pageSize, total);

  const paginatedRecords = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return records.slice(start, start + pageSize);
  }, [records, safePage, pageSize]);

  if (loading && !data) return <Loader />;
  if (error && !data) {
    return <ErrorState description={error} onRetry={load} />;
  }
  if (!data) {
    return (
      <div className="flex min-h-[120px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 px-4 py-4 text-center">
        <h3 className="text-base font-semibold text-[#102A56]">
          Assessment progress is not available
        </h3>
        <p className="mt-1 max-w-md text-sm text-[#647A9B]">
          Assessment records for this enrollment could not be loaded.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="min-w-0">
        <h2 className="text-[22px] font-bold tracking-tight text-[#102A56] sm:text-[26px]">
          Assessment Progress
        </h2>
        <p className="text-xs text-[#647A9B] sm:text-[13px]">
          Assessment records for {enrollment.enrollmentNumber} (
          {formatEnrollmentOverviewContextLabel(enrollment)})
        </p>
      </div>

      <Card className="overflow-hidden rounded-xl border border-[#E1EBF5] bg-white p-0 shadow-sm">
        <div className="border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] px-4 py-3">
          <h3 className="text-base font-semibold text-[#102A56]">
            Enrollment Context
          </h3>
          <p className="mt-0.5 text-sm text-[#647A9B]">
            Student, batch and course summary for this assessment view.
          </p>
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
          <SummaryCard
            label="Student"
            value={`${data.student.name} (${data.student.studentCode})`}
          />
          <SummaryCard
            label="Batch"
            value={formatBatchLabel(data.batch.name, data.batch.code)}
          />
          <SummaryCard
            label="Learning Mode"
            value={formatMode(data.timing?.mode)}
          />
          <SummaryCard label="Batch Timing" value={data.timing?.name ?? "—"} />
          <SummaryCard label="Course" value={data.course.title} />
          <SummaryCard
            label="Overall Performance"
            value={
              data.totalAssessments > 0
                ? `${data.overallPerformance}%`
                : "—"
            }
          />
        </div>
      </Card>

      <Card className="overflow-hidden rounded-xl border border-[#E1EBF5] bg-white p-0 shadow-sm">
        <div className="border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] px-4 py-3">
          <h3 className="text-base font-semibold text-[#102A56]">
            Assessment Performance Summary
          </h3>
        </div>
        <div className="space-y-4 p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <SummaryCard
              label="Total Assessments"
              value={String(data.totalAssessments)}
            />
            <SummaryCard
              label="Average Marks"
              value={String(data.summary.averageMarks)}
            />
            <SummaryCard
              label="Average Percentage"
              value={`${data.summary.averagePercentage}%`}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {data.assessmentTypes.length ? (
              data.assessmentTypes.map((type) => (
                <div
                  key={type}
                  className="rounded-lg border border-[#E8F0FA] bg-[#F8FBFF] px-3 py-2 text-sm"
                >
                  <span className="font-medium text-[#102A56]">{type}</span>
                  <span className="ml-2 text-[#647A9B]">
                    {data.countsByType[type] ?? 0}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#647A9B]">
                No assessments recorded yet.
              </p>
            )}
          </div>
        </div>
      </Card>

      <Card className={BRANCH_TABLE_CARD_CLASS}>
        <div className="border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] px-4 py-3">
          <h3 className="text-base font-semibold text-[#102A56]">
            Assessment Records
          </h3>
          <p className="mt-0.5 text-sm text-[#647A9B]">
            Detailed assessment entries for this enrollment.
          </p>
        </div>

        <BranchManageTableShell
          columns={RECORD_COLUMNS}
          isLoading={loading}
          isEmpty={!loading && total === 0}
          emptyTitle="No assessment records found"
          emptyDescription="Assessment records for this enrollment will appear here."
          emptyIcon={ClipboardList}
          embedded
        >
          {paginatedRecords.map((record) => (
            <tr
              key={record.id}
              className="border-b border-slate-100 bg-white transition-colors hover:bg-slate-50"
            >
              <td className={`${TABLE_CELL_CLASS} whitespace-nowrap text-slate-700`}>
                {formatAttendanceDisplayDate(String(record.date))}
              </td>
              <td className={`${TABLE_CELL_CLASS} min-w-[140px] font-medium text-[#102A56]`}>
                {record.name}
              </td>
              <td className={TABLE_CELL_CLASS}>
                <Badge variant="default">{record.type}</Badge>
              </td>
              <td className={`${TABLE_CELL_CLASS} text-slate-700`}>
                {record.maxMarks}
              </td>
              <td className={`${TABLE_CELL_CLASS} text-slate-700`}>
                {record.obtainedMarks}
              </td>
              <td className={`${TABLE_CELL_CLASS} text-slate-700`}>
                {record.percentage}%
              </td>
              <td className={`${TABLE_CELL_CLASS} text-slate-700`}>
                {record.remarks ?? "—"}
              </td>
            </tr>
          ))}
        </BranchManageTableShell>

        <BranchManagePaginationFooter
          from={from}
          to={to}
          total={total}
          page={safePage}
          pageSize={pageSize}
          totalPages={totalPages}
          disabled={loading}
          onPageChange={setPage}
          onPageSizeChange={(nextPageSize) => {
            setPageSize(nextPageSize);
            setPage(1);
          }}
        />
      </Card>
    </div>
  );
}
