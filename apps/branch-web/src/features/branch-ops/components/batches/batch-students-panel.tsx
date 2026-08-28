"use client";

import { useMemo, useState } from "react";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import { StudentActivityModal } from "@/src/features/branch-ops/components/batches/student-activity-modal";
import type { BatchStudentItem } from "@/src/features/branch-ops/types";
import {
  formatBatchDate,
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
}

export function BatchStudentsPanel({ batchId }: Props) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);

  const { data, loading, error, reload } = useAsyncData(
    () => branchOpsApi.batchStudents(batchId),
    [batchId],
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const items = data ?? [];
    if (!term) return items;
    return items.filter((student) => {
      const haystack = [
        student.firstName,
        student.lastName,
        student.email,
        student.phone,
        student.studentCode,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [data, search]);

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  if (loading) return <Loader />;
  if (error) return <ErrorState description={error} onRetry={reload} />;

  return (
    <div className="space-y-4">
      <SearchInput
        value={search}
        placeholder="Search enrolled students..."
        className="h-[46px] rounded-xl sm:max-w-sm"
        onChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
      />

      <div className="overflow-x-auto rounded-2xl border border-[#E1EBF5] bg-white">
        {!filtered.length ? (
          <EmptyState title="No students are enrolled in this batch." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Student ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Enrollment date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((student: BatchStudentItem) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium text-[#102A56]">
                    {studentName(student)}
                  </TableCell>
                  <TableCell>{student.studentCode}</TableCell>
                  <TableCell>{student.email || "—"}</TableCell>
                  <TableCell>{student.phone || "—"}</TableCell>
                  <TableCell>{formatBatchDate(student.enrollmentDate)}</TableCell>
                  <TableCell>
                    <Badge variant="info">
                      {student.enrollmentStatus ?? student.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {student.attendance
                      ? `${student.attendance.percentage}%`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      className="text-sm font-medium text-[#2563EB] hover:underline"
                      onClick={() => setActiveStudentId(student.id)}
                    >
                      Activity
                    </button>
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

      <StudentActivityModal
        open={Boolean(activeStudentId)}
        batchId={batchId}
        studentId={activeStudentId ?? ""}
        onClose={() => setActiveStudentId(null)}
      />
    </div>
  );
}
