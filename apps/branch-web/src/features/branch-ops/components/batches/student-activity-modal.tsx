"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import type { AttendanceSummary } from "@/src/features/branch-ops/types";
import {
  formatBatchDate,
  formatBatchLabel,
  formatBatchStatus,
  formatDurationMinutes,
} from "@/src/features/branch-ops/utils/batch-display";
import { Badge } from "@/src/shared/components/ui/badge";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Loader } from "@/src/shared/components/ui/loader";
import { Modal } from "@/src/shared/components/ui/model";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/shared/components/ui/table";

interface Props {
  open: boolean;
  batchId: string;
  studentId: string;
  onClose: () => void;
}

function attendanceVariant(status: string) {
  if (status === "PRESENT") return "success" as const;
  if (status === "LATE") return "warning" as const;
  if (status === "LEAVE") return "info" as const;
  return "danger" as const;
}

function SummaryCard({
  label,
  summary,
}: {
  label: string;
  summary: AttendanceSummary;
}) {
  return (
    <div className="rounded-xl border border-[#E1EBF5] bg-[#F8FBFF] p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-[#647A9B]">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-[#102A56]">
        {summary.percentage}%
      </p>
      <p className="text-xs text-[#647A9B]">
        {summary.present} present · {summary.absent} absent · {summary.total}{" "}
        sessions
      </p>
    </div>
  );
}

export function StudentActivityModal({
  open,
  batchId,
  studentId,
  onClose,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<
    Awaited<ReturnType<typeof branchOpsApi.studentBatchActivity>> | null
  >(null);

  useEffect(() => {
    if (!open || !batchId || !studentId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    branchOpsApi
      .studentBatchActivity(batchId, studentId)
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
        setError(message ?? "Unable to load student activity.");
        setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, batchId, studentId]);

  return (
    <Modal
      open={open}
      title={data ? `${data.student.name} · activity` : "Student activity"}
      onClose={onClose}
      contentClassName="max-w-4xl"
    >
      {loading ? (
        <Loader />
      ) : error ? (
        <ErrorState description={error} />
      ) : !data ? (
        <EmptyState title="No activity found for this student in this batch." />
      ) : (
        <div className="space-y-6">
          <section className="rounded-xl border border-[#E1EBF5] bg-[#F8FBFF] p-4">
            <h3 className="mb-3 text-sm font-semibold text-[#102A56]">
              Profile & enrollment
            </h3>
            <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-[#647A9B]">
                  Student code
                </dt>
                <dd className="mt-1 font-mono text-sm text-[#102A56]">
                  {data.student.studentCode}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-[#647A9B]">
                  Name
                </dt>
                <dd className="mt-1 text-sm font-medium text-[#102A56]">
                  {data.student.name}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-[#647A9B]">
                  Batch
                </dt>
                <dd className="mt-1 text-sm text-[#102A56]">
                  {formatBatchLabel(data.batch.name, data.batch.code)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-[#647A9B]">
                  Enrollment status
                </dt>
                <dd className="mt-1">
                  <Badge variant="info">
                    {formatBatchStatus(data.enrollmentStatus)}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-[#647A9B]">
                  Enrollment date
                </dt>
                <dd className="mt-1 text-sm text-[#102A56]">
                  {formatBatchDate(data.enrollmentDate)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-[#647A9B]">
                  Email
                </dt>
                <dd className="mt-1 text-sm text-[#102A56]">
                  {data.student.email || "—"}
                </dd>
              </div>
            </dl>
          </section>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard label="Overall" summary={data.attendance.overall} />
            <SummaryCard label="This week" summary={data.attendance.weekly} />
            <SummaryCard label="This month" summary={data.attendance.monthly} />
            <SummaryCard label="This year" summary={data.attendance.yearly} />
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/attendance"
              className="inline-flex h-9 items-center rounded-xl bg-[#2447A8] px-4 text-sm font-medium text-white hover:bg-[#1E3A8A]"
            >
              Record attendance
            </Link>
            <Link
              href="/assessments"
              className="inline-flex h-9 items-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium text-[#102A56] hover:bg-slate-50"
            >
              Record marks
            </Link>
          </div>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#102A56]">
              Attendance
            </h3>
            {!data.attendance.items.length ? (
              <EmptyState title="No attendance records for this batch." />
            ) : (
              <div className="overflow-hidden rounded-xl border border-[#E1EBF5]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Session</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Punch in</TableHead>
                      <TableHead>Punch out</TableHead>
                      <TableHead>Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.attendance.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{formatBatchDate(item.date)}</TableCell>
                        <TableCell>
                          {item.session?.label ??
                            (item.session?.sessionNumber != null
                              ? `Session ${item.session.sessionNumber}`
                              : "—")}
                        </TableCell>
                        <TableCell>{item.course?.title ?? "—"}</TableCell>
                        <TableCell>
                          <Badge variant={attendanceVariant(item.status)}>
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {item.punchIn
                            ? new Date(item.punchIn).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "—"}
                        </TableCell>
                        <TableCell>
                          {item.punchOut
                            ? new Date(item.punchOut).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "—"}
                        </TableCell>
                        <TableCell>
                          {formatDurationMinutes(item.durationMinutes)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-[#102A56]">
              Academic activity
            </h3>
            {!data.assessments.length ? (
              <EmptyState title="No assessments recorded for this batch." />
            ) : (
              <div className="overflow-hidden rounded-xl border border-[#E1EBF5]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Marks</TableHead>
                      <TableHead>%</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.assessments.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium text-[#102A56]">
                          {item.name}
                        </TableCell>
                        <TableCell>{item.type}</TableCell>
                        <TableCell>{formatBatchDate(item.date)}</TableCell>
                        <TableCell>
                          {item.obtainedMarks}/{item.maxMarks}
                        </TableCell>
                        <TableCell>{item.percentage}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </section>
        </div>
      )}
    </Modal>
  );
}
