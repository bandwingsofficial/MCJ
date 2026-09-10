"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import type { BatchListItem } from "@/src/features/branch-ops/types";
import {
  getBatchModeSectionLabel,
  getConfiguredBatchModes,
  getTimingsForMode,
  type BatchMode,
} from "@/src/features/branch-ops/utils/batch-mode.utils";
import {
  BLOCKED_BATCH_SELECTION_MESSAGE,
  isBatchSelectableForAssignment,
} from "@/src/features/branch-ops/utils/batch-selection.utils";
import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Loader } from "@/src/shared/components/ui/loader";
import { SearchInput } from "@/src/shared/components/ui/search-input";
import { AppSelect } from "@/src/shared/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/shared/components/ui/table";

function studentAssessmentDetailPath(
  batchId: string,
  timingId: string,
  studentId: string,
) {
  return `/assessments/progress/${batchId}/${timingId}/${studentId}`;
}

interface Props {
  batches: BatchListItem[];
  reloadKey?: number;
}

export function AssessmentProgressPanel({ batches, reloadKey = 0 }: Props) {
  const router = useRouter();
  const [batchId, setBatchId] = useState("");
  const [mode, setMode] = useState<BatchMode | "">("");
  const [batchTimingId, setBatchTimingId] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [data, setData] =
    useState<Awaited<
      ReturnType<typeof branchOpsApi.batchTimingAssessmentProgress>
    > | null>(null);

  const selectableBatches = useMemo(
    () => batches.filter((batch) => isBatchSelectableForAssignment(batch)),
    [batches],
  );

  const selectedBatch =
    selectableBatches.find((batch) => batch.id === batchId) ?? null;

  const modeOptions = useMemo(() => {
    if (!selectedBatch) return [];
    return getConfiguredBatchModes(selectedBatch).map((item) => ({
      label: getBatchModeSectionLabel(item),
      value: item,
    }));
  }, [selectedBatch]);

  const timingOptions = useMemo(() => {
    if (!selectedBatch || !mode) return [];
    return getTimingsForMode(selectedBatch, mode).map((timing) => ({
      label: timing.name,
      value: timing.id,
    }));
  }, [mode, selectedBatch]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setMode("");
    setBatchTimingId("");
  }, [batchId]);

  useEffect(() => {
    setBatchTimingId("");
  }, [mode]);

  useEffect(() => {
    if (!batchId || !batchTimingId) {
      setData(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    branchOpsApi
      .batchTimingAssessmentProgress(batchId, batchTimingId, {
        search: debouncedSearch || undefined,
      })
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load batch progress.",
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
  }, [batchId, batchTimingId, debouncedSearch, reloadKey, retryKey]);

  const selectionComplete = Boolean(batchId && mode && batchTimingId);

  return (
    <Card className="space-y-4 p-4">
      <div>
        <h2 className="text-sm font-semibold text-[#102A56]">Batch Progress</h2>
        <p className="mt-1 text-sm text-slate-500">
          View assessment progress by batch, learning mode, and batch timing.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <AppSelect
          value={batchId || undefined}
          placeholder="Select main batch"
          onValueChange={setBatchId}
          options={selectableBatches.map((batch) => ({
            label: `${batch.name} (${batch.code})`,
            value: batch.id,
          }))}
        />
        <AppSelect
          value={mode || undefined}
          placeholder={batchId ? "Select learning mode" : "Select batch first"}
          onValueChange={(value) => setMode(value as BatchMode)}
          options={modeOptions}
          disabled={!batchId}
        />
        <AppSelect
          value={batchTimingId || undefined}
          placeholder={mode ? "Select batch timing" : "Select mode first"}
          onValueChange={setBatchTimingId}
          options={timingOptions}
          disabled={!mode}
        />
        <SearchInput
          value={search}
          placeholder="Search student..."
          className="h-[46px] rounded-xl"
          onChange={setSearch}
        />
      </div>

      {!selectableBatches.length ? (
        <p className="text-sm text-amber-700">{BLOCKED_BATCH_SELECTION_MESSAGE}</p>
      ) : null}

      {!selectionComplete ? (
        <EmptyState title="Select batch, learning mode, and batch timing to view progress." />
      ) : loading && !data ? (
        <Loader />
      ) : error && !data ? (
        <ErrorState
          description={error}
          onRetry={() => setRetryKey((value) => value + 1)}
        />
      ) : !data?.students.length ? (
        <EmptyState title="No students found for this batch timing." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Student Name</TableHead>
                {data.assessmentTypes.map((assessmentType) => (
                  <TableHead key={assessmentType}>{assessmentType}</TableHead>
                ))}
                <TableHead>Total Assessments</TableHead>
                <TableHead>Overall Performance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.students.map((row) => (
                <TableRow key={row.student.id}>
                  <TableCell className="font-mono text-xs">
                    {row.student.studentCode}
                  </TableCell>
                  <TableCell className="font-medium text-[#102A56]">
                    {row.student.name}
                  </TableCell>
                  {data.assessmentTypes.map((assessmentType) => (
                    <TableCell key={`${row.student.id}-${assessmentType}`}>
                      {row.countsByType[assessmentType] ?? 0}
                    </TableCell>
                  ))}
                  <TableCell>{row.totalAssessments}</TableCell>
                  <TableCell>
                    {row.overallPerformance != null
                      ? `${row.overallPerformance}%`
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(
                          studentAssessmentDetailPath(
                            batchId,
                            batchTimingId,
                            row.student.id,
                          ),
                        )
                      }
                    >
                      <Eye className="mr-1.5 h-4 w-4" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
}
