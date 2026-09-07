"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import type { BatchStudentItem } from "@/src/features/branch-ops/types";
import {
  formatBatchMode,
  formatBatchStatus,
  studentName,
} from "@/src/features/branch-ops/utils/batch-display";
import { Badge } from "@/src/shared/components/ui/badge";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Loader } from "@/src/shared/components/ui/loader";
import { SearchInput } from "@/src/shared/components/ui/search-input";
import { TablePaginationBar } from "@/src/shared/components/ui/table-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/shared/components/ui/table";
import { useAsyncData } from "@/src/shared/hooks/use-async-data";

interface Props {
  batchId: string;
  timingId: string;
}

export function BatchTimingStudentsPanel({ batchId, timingId }: Props) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, loading, error, reload } = useAsyncData(
    () => branchOpsApi.batchStudents(batchId),
    [batchId],
  );

  const filtered = useMemo(() => {
    const items = (data ?? []).filter(
      (student) => student.batchTiming?.id === timingId,
    );
    const term = search.trim().toLowerCase();
    if (!term) return items;

    return items.filter((student) => {
      const haystack = [
        student.firstName,
        student.lastName,
        student.studentCode,
        student.email,
        student.phone,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [data, search, timingId]);

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  if (loading) return <Loader />;
  if (error) return <ErrorState description={error} onRetry={reload} />;

  return (
    <div className="space-y-4">
      <SearchInput
        value={search}
        placeholder="Search admitted students..."
        className="h-[46px] rounded-xl sm:max-w-sm"
        onChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
      />

      <div className="overflow-x-auto rounded-2xl border border-[#E1EBF5] bg-white">
        {!filtered.length ? (
          <EmptyState title="No admitted students are assigned to this batch timing." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student code</TableHead>
                <TableHead>Student name</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((student: BatchStudentItem) => (
                <TableRow key={student.enrollmentId ?? student.id}>
                  <TableCell className="font-mono text-sm text-slate-700">
                    {student.studentCode}
                  </TableCell>
                  <TableCell className="font-medium text-[#102A56]">
                    {studentName(student)}
                  </TableCell>
                  <TableCell>
                    {formatBatchMode(student.batchTiming?.mode)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="info">
                      {formatBatchStatus(student.enrollmentStatus)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/students/${student.id}`}
                      className="text-sm font-medium text-[#2563EB] hover:underline"
                    >
                      Manage
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <TablePaginationBar
          page={page}
          pageSize={pageSize}
          total={filtered.length}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </div>
    </div>
  );
}
