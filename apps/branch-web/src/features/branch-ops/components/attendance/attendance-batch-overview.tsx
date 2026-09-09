"use client";

import { useEffect, useState } from "react";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import type {
  BatchListItem,
  BatchTimingAttendanceOverview,
  BatchTimingStudentAttendanceRow,
} from "@/src/features/branch-ops/types";
import { getBatchModeSectionLabel } from "@/src/features/branch-ops/utils/batch-mode.utils";
import { Card } from "@/src/shared/components/ui/card";
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
import { cn } from "@/src/shared/lib/cn";

interface Props {
  batches: BatchListItem[];
  initialBatchId?: string;
}

export function AttendanceBatchOverview({
  batches,
  initialBatchId,
}: Props) {
  const [batchId, setBatchId] = useState(initialBatchId ?? "");
  const [overview, setOverview] = useState<BatchTimingAttendanceOverview | null>(
    null,
  );
  const [selectedTimingId, setSelectedTimingId] = useState<string | null>(
    null,
  );
  const [students, setStudents] = useState<BatchTimingStudentAttendanceRow[]>(
    [],
  );
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialBatchId) setBatchId(initialBatchId);
  }, [initialBatchId]);

  useEffect(() => {
    if (!batchId) {
      setOverview(null);
      setSelectedTimingId(null);
      setStudents([]);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoadingOverview(true);
    setError(null);
    setSelectedTimingId(null);
    setStudents([]);

    branchOpsApi
      .batchTimingAttendanceOverview(batchId)
      .then((result) => {
        if (!cancelled) setOverview(result);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err && typeof err === "object" && "response" in err
            ? (err as { response?: { data?: { message?: string } } }).response
                ?.data?.message
            : null;
        setError(message ?? "Unable to load batch attendance overview.");
        setOverview(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingOverview(false);
      });

    return () => {
      cancelled = true;
    };
  }, [batchId]);

  useEffect(() => {
    if (!batchId || !selectedTimingId) {
      setStudents([]);
      return;
    }

    let cancelled = false;
    setLoadingStudents(true);

    branchOpsApi
      .batchTimingStudentAttendance(batchId, selectedTimingId)
      .then((result) => {
        if (!cancelled) setStudents(result.students);
      })
      .catch(() => {
        if (!cancelled) setStudents([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingStudents(false);
      });

    return () => {
      cancelled = true;
    };
  }, [batchId, selectedTimingId]);

  const selectedTiming = overview?.modes
    .flatMap((section) => section.timings)
    .find((timing) => timing.id === selectedTimingId);

  return (
    <div className="space-y-4">
      <div className="max-w-md">
        <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
          Main Batch
        </label>
        <AppSelect
          value={batchId || undefined}
          placeholder="Select main batch"
          onValueChange={(value) => {
            setBatchId(value);
            setSelectedTimingId(null);
          }}
          options={batches.map((batch) => ({
            label: `${batch.name} (${batch.code})`,
            value: batch.id,
          }))}
        />
      </div>

      {!batchId ? (
        <EmptyState title="Select a main batch to view attendance by batch timing." />
      ) : loadingOverview ? (
        <Loader />
      ) : error ? (
        <ErrorState description={error} />
      ) : !overview ? (
        <EmptyState title="No batch attendance data." />
      ) : !overview.modes.length ? (
        <EmptyState title="No batch timings configured for this batch." />
      ) : (
        <>
          <div>
            <h3 className="text-sm font-semibold text-[#102A56]">
              {overview.batch.name}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Attendance grouped by learning mode and batch timing
            </p>
          </div>

          {overview.modes.map((section) => (
            <Card key={section.mode} className="overflow-hidden p-0">
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                <h4 className="text-sm font-semibold text-[#102A56]">
                  {getBatchModeSectionLabel(section.mode)}
                </h4>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Batch Timing</TableHead>
                      <TableHead>Enrolled Students</TableHead>
                      <TableHead>Total Attendance Sessions</TableHead>
                      <TableHead>Present</TableHead>
                      <TableHead>Absent</TableHead>
                      <TableHead>Late</TableHead>
                      <TableHead>Attendance %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {section.timings.map((timing) => (
                      <TableRow
                        key={timing.id}
                        className={cn(
                          "cursor-pointer hover:bg-slate-50",
                          selectedTimingId === timing.id && "bg-sky-50/80",
                        )}
                        onClick={() => setSelectedTimingId(timing.id)}
                      >
                        <TableCell className="font-medium text-[#102A56]">
                          {timing.name}
                        </TableCell>
                        <TableCell>{timing.enrolledStudents}</TableCell>
                        <TableCell>{timing.sessionsConducted}</TableCell>
                        <TableCell>{timing.present}</TableCell>
                        <TableCell>{timing.absent}</TableCell>
                        <TableCell>{timing.late}</TableCell>
                        <TableCell>
                          {timing.totalRecords > 0
                            ? `${timing.percentage}%`
                            : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          ))}

          {selectedTimingId ? (
            <Card className="space-y-3 p-4">
              <div>
                <h4 className="text-sm font-semibold text-[#102A56]">
                  Students · {selectedTiming?.name ?? "Batch Timing"}
                </h4>
                <p className="mt-1 text-sm text-slate-500">
                  Attendance for students assigned to this exact batch timing
                  only.
                </p>
              </div>

              {loadingStudents ? (
                <Loader />
              ) : !students.length ? (
                <EmptyState title="No admitted students in this batch timing." />
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Present</TableHead>
                        <TableHead>Absent</TableHead>
                        <TableHead>Late</TableHead>
                        <TableHead>Attendance %</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium text-[#102A56]">
                            {student.name}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {student.studentCode}
                          </TableCell>
                          <TableCell>{student.present}</TableCell>
                          <TableCell>{student.absent}</TableCell>
                          <TableCell>{student.late}</TableCell>
                          <TableCell>
                            {student.totalRecords > 0
                              ? `${student.percentage}%`
                              : "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Card>
          ) : null}
        </>
      )}
    </div>
  );
}
