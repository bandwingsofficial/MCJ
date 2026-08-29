"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import type {
  BatchAttendanceAnalytics,
  BatchListItem,
} from "@/src/features/branch-ops/types";
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
import { Card } from "@/src/shared/components/ui/card";

interface Props {
  batches: BatchListItem[];
  initialBatchId?: string;
}

export function AttendanceBatchOverview({
  batches,
  initialBatchId,
}: Props) {
  const [batchId, setBatchId] = useState(initialBatchId ?? "");
  const [data, setData] = useState<BatchAttendanceAnalytics | null>(null);
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
      .batchAttendanceSummary(batchId)
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
        setError(message ?? "Unable to load batch attendance.");
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
    <div className="space-y-4">
      <div className="max-w-md">
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

      {!batchId ? (
        <EmptyState title="Select a batch to view attendance overview." />
      ) : loading ? (
        <Loader />
      ) : error ? (
        <ErrorState description={error} />
      ) : !data ? (
        <EmptyState title="No batch attendance data." />
      ) : (
        <>
          <div>
            <h3 className="text-sm font-semibold text-[#102A56]">
              Batch Attendance Overview
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {data.batch.name} · {data.batch.code}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Card className="p-4">
              <p className="text-xs text-slate-500">Total Students</p>
              <p className="mt-1 text-lg font-semibold text-[#102A56]">
                {data.overview.enrolledStudents}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-slate-500">Sessions Conducted</p>
              <p className="mt-1 text-lg font-semibold text-[#102A56]">
                {data.overview.sessionsConducted}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-slate-500">Average Attendance</p>
              <p className="mt-1 text-lg font-semibold text-[#102A56]">
                {data.overview.averageAttendance == null
                  ? "Not Started"
                  : `${data.overview.averageAttendance}%`}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-slate-500">Records</p>
              <p className="mt-1 text-lg font-semibold text-[#102A56]">
                {data.overview.totalAttendanceRecords}
              </p>
            </Card>
          </div>

          {!data.students.length ? (
            <EmptyState title="No students enrolled in this batch." />
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
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.students.map((student) => (
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
                        {student.percentage == null
                          ? "Not Started"
                          : `${student.percentage}%`}
                        {student.ratioLabel ? (
                          <span className="ml-1 text-xs text-slate-500">
                            ({student.ratioLabel})
                          </span>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/attendance/details/${batchId}/${student.id}`}
                          className="inline-flex h-8 items-center rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-[#2563EB] hover:bg-sky-50"
                        >
                          Details
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
