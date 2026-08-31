"use client";

import { useEffect, useState } from "react";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import type {
  BatchAssessmentAnalytics,
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

const TYPE_COLUMNS = [
  "TEST",
  "PRESENTATION",
  "ASSIGNMENT",
  "PRACTICAL",
  "OTHER",
] as const;

function formatTypeValue(value: number | null | undefined) {
  if (value == null) return "—";
  return `${value}%`;
}

interface Props {
  batches: BatchListItem[];
  initialBatchId?: string;
}

export function AssessmentBatchOverview({
  batches,
  initialBatchId,
}: Props) {
  const [batchId, setBatchId] = useState(initialBatchId ?? "");
  const [data, setData] = useState<BatchAssessmentAnalytics | null>(null);
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
      .batchAssessmentSummary(batchId)
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
        setError(message ?? "Unable to load batch assessment overview.");
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
        <EmptyState title="Select a batch to view assessment overview." />
      ) : loading ? (
        <Loader />
      ) : error ? (
        <ErrorState description={error} />
      ) : !data ? (
        <EmptyState title="No batch assessment data." />
      ) : (
        <>
          <div>
            <h3 className="text-sm font-semibold text-[#102A56]">
              Batch Assessment Overview
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {data.batch.name} · {data.batch.code}
            </p>
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
                    <TableHead>Total Assessments</TableHead>
                    {TYPE_COLUMNS.map((type) => (
                      <TableHead key={type}>{type}</TableHead>
                    ))}
                    <TableHead>Average %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.students.map((row) => (
                    <TableRow key={row.student.id}>
                      <TableCell className="font-medium text-[#102A56]">
                        {row.student.name}
                      </TableCell>
                      <TableCell>{row.student.studentCode}</TableCell>
                      <TableCell>{row.totalAssessments}</TableCell>
                      {TYPE_COLUMNS.map((type) => (
                        <TableCell key={type}>
                          {formatTypeValue(row.byType[type])}
                        </TableCell>
                      ))}
                      <TableCell>
                        {formatTypeValue(row.averagePercentage)}
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
