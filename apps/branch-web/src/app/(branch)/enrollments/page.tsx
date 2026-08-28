"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import { Badge } from "@/src/shared/components/ui/badge";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { ListPageHeader } from "@/src/shared/components/ui/list-page-header";
import { Loader } from "@/src/shared/components/ui/loader";
import { SearchInput } from "@/src/shared/components/ui/search-input";
import { AppSelect } from "@/src/shared/components/ui/select";
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
import { useAuthStore } from "@/src/features/auth/store/auth.store";
import { formatRoleLabel } from "@/src/core/auth/roles";

const STATUS_OPTIONS = [
  { label: "All Status", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Pending Approval", value: "PENDING_APPROVAL" },
  { label: "Admitted", value: "ADMITTED" },
  { label: "Active", value: "ACTIVE" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Dropped", value: "DROPPED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export default function EnrollmentsPage() {
  const role = useAuthStore((state) => state.user?.role);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [batchId, setBatchId] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [search]);

  const batchesQuery = useAsyncData(() => branchOpsApi.batches(), []);
  const query = useAsyncData(
    () =>
      branchOpsApi.enrollments({
        search: debouncedSearch || undefined,
        batchId: batchId === "ALL" ? undefined : batchId,
        status: status === "ALL" ? undefined : status,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    [debouncedSearch, batchId, status, page, pageSize],
  );

  const items = query.data?.items ?? [];
  const total = query.data?.count ?? 0;

  return (
    <div className="space-y-5">
      <ListPageHeader
        parentLabel={formatRoleLabel(role) || "Branch"}
        currentLabel="Student Enrollments"
        title="Student Enrollments"
        totalLabel="Total Enrolled"
        total={total}
        filters={
          <>
            <div className="w-full sm:w-[280px]">
              <SearchInput
                value={search}
                placeholder="Search enrollments..."
                className="h-[46px] rounded-xl"
                onChange={setSearch}
              />
            </div>
            <div className="w-full sm:w-[200px]">
              <AppSelect
                value={batchId}
                triggerClassName="h-[46px] rounded-xl"
                onValueChange={(value) => {
                  setBatchId(value);
                  setPage(1);
                }}
                options={[
                  { label: "All Batches", value: "ALL" },
                  ...(batchesQuery.data ?? []).map((batch) => ({
                    label: batch.name,
                    value: batch.id,
                  })),
                ]}
              />
            </div>
            <div className="w-full sm:w-[180px]">
              <AppSelect
                value={status}
                triggerClassName="h-[46px] rounded-xl"
                onValueChange={(value) => {
                  setStatus(value);
                  setPage(1);
                }}
                options={STATUS_OPTIONS}
              />
            </div>
          </>
        }
      />

      {query.loading ? (
        <Loader />
      ) : query.error ? (
        <ErrorState description={query.error} onRetry={query.reload} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#E1EBF5] bg-white">
          {!items.length ? (
            <EmptyState title="No enrollments found." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Enrollment number</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Enrollment date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-[#102A56]">
                          {[item.student.firstName, item.student.lastName]
                            .filter(Boolean)
                            .join(" ")}
                        </p>
                        <p className="text-xs text-[#647A9B]">
                          {item.student.email || item.student.phone || "—"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{item.enrollmentNumber}</TableCell>
                    <TableCell>{item.batch?.name ?? "—"}</TableCell>
                    <TableCell>{item.course?.title ?? "—"}</TableCell>
                    <TableCell>
                      {item.enrollmentDate
                        ? String(item.enrollmentDate).slice(0, 10)
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge>{item.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/students/${item.student.id}`}
                        className="text-sm font-medium text-[#2563EB] hover:underline"
                      >
                        View
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
            total={total}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        </div>
      )}
    </div>
  );
}
