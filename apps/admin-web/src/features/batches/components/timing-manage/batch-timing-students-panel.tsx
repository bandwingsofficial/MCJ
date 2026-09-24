"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { BatchManageSection } from "@/src/features/batches/components/manage/batch-manage-section";
import type { BatchTiming } from "@/src/features/batches/types/batch.types";
import { formatPersonName } from "@/src/features/branches/utils/branch-display.utils";
import { EnrollmentStatusBadge } from "@/src/features/enrollments/components/table/EnrollmentStatusBadge";
import { enrollmentService } from "@/src/features/enrollments/services/enrollment.service";
import { EnrollmentStatus, SortOrder } from "@/src/features/enrollments/types/enrollment.enums";
import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";
import { parseEnrollmentListResponse } from "@/src/features/enrollments/utils/enrollment-list.utils";
import { enrollmentManagePath } from "@/src/features/enrollments/utils/enrollment-manage.routes";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { AppSelect } from "@/src/shared/components/ui/select";
import { SearchInput } from "@/src/shared/components/ui/search-input";
import { Skeleton } from "@/src/shared/components/ui/skeleton";
import { TablePaginationBar } from "@/src/shared/components/ui/table-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/shared/components/ui/table";

interface Props {
  timing: BatchTiming;
}

type StudentStatusFilter =
  | "ALL"
  | EnrollmentStatus.ADMITTED
  | EnrollmentStatus.CANCELLED;

const DEFAULT_PAGE_SIZE = 10;
const TIMING_STUDENT_STATUS_IN = "ADMITTED,CANCELLED";

const STUDENT_STATUS_FILTER_OPTIONS: Array<{
  label: string;
  value: StudentStatusFilter;
}> = [
  { label: "Admitted", value: EnrollmentStatus.ADMITTED },
  { label: "Cancelled", value: EnrollmentStatus.CANCELLED },
  { label: "All", value: "ALL" },
];

function formatBranchLabel(branch?: Enrollment["branch"] | null): string {
  if (!branch?.branchName) {
    return "—";
  }

  return branch.branchCode
    ? `${branch.branchName} (${branch.branchCode})`
    : branch.branchName;
}

function paginationParams(page: number, pageSize: number) {
  const safePage = page >= 1 ? page : 1;
  const safeTake = pageSize >= 1 ? pageSize : DEFAULT_PAGE_SIZE;

  return {
    skip: (safePage - 1) * safeTake,
    take: safeTake,
  };
}

export function BatchTimingStudentsPanel({ timing }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StudentStatusFilter>(
    EnrollmentStatus.ADMITTED,
  );
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [admittedCount, setAdmittedCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [isLoading, setIsLoading] = useState(true);

  const trimmedSearch = search.trim();

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        const { skip, take } = paginationParams(page, pageSize);

        const [admittedResponse, listResponse] = await Promise.all([
          enrollmentService.getEnrollments({
            batchTimingId: timing.id,
            status: EnrollmentStatus.ADMITTED,
            includeDeleted: false,
            skip: 0,
            take: 1,
          }),
          enrollmentService.getEnrollments({
            batchTimingId: timing.id,
            search: trimmedSearch || undefined,
            ...(statusFilter === "ALL"
              ? { statusIn: TIMING_STUDENT_STATUS_IN }
              : { status: statusFilter }),
            includeDeleted: false,
            skip,
            take,
            sortBy: "createdAt",
            sortOrder: SortOrder.DESC,
          }),
        ]);

        if (cancelled) {
          return;
        }

        const admittedTotal = parseEnrollmentListResponse(admittedResponse).total;
        const list = parseEnrollmentListResponse(listResponse);

        setAdmittedCount(admittedTotal);
        setTotalCount(list.total);
        setEnrollments(list.items);
      } catch {
        if (!cancelled) {
          setAdmittedCount(0);
          setTotalCount(0);
          setEnrollments([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [page, pageSize, statusFilter, timing.id, trimmedSearch]);

  const availableSeats = useMemo(
    () => Math.max(0, timing.capacity - admittedCount),
    [admittedCount, timing.capacity],
  );

  const emptyTitle = useMemo(() => {
    if (trimmedSearch) {
      return "No students match your search.";
    }

    if (statusFilter === EnrollmentStatus.CANCELLED) {
      return "No cancelled students for this batch timing.";
    }

    if (statusFilter === "ALL") {
      return "No admitted or cancelled students for this batch timing.";
    }

    return "No admitted students assigned to this batch timing yet.";
  }, [statusFilter, trimmedSearch]);

  return (
    <BatchManageSection
      title="Students"
      description={`${admittedCount} enrolled · ${availableSeats} seats available · ${timing.capacity} capacity`}
    >
      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1 sm:max-w-sm">
            <SearchInput
              value={search}
              placeholder="Search name, code, phone, or email"
              className="h-[46px] rounded-xl"
              onChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
            />
          </div>
          <div className="w-full sm:w-44">
            <AppSelect
              value={statusFilter}
              options={STUDENT_STATUS_FILTER_OPTIONS.map((option) => ({
                label: option.label,
                value: option.value,
              }))}
              onValueChange={(value) => {
                setStatusFilter(value as StudentStatusFilter);
                setPage(1);
              }}
            />
          </div>
        </div>

        {isLoading ? (
          <Skeleton className="h-48 w-full rounded-xl" />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-[#E1EBF5] bg-white">
            {!enrollments.length ? (
              <EmptyState title={emptyTitle} />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student name</TableHead>
                    <TableHead>Student code</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrollments.map((enrollment) => (
                    <TableRow key={enrollment.id}>
                      <TableCell className="min-w-[140px] font-medium text-[#102A56]">
                        {formatPersonName(
                          enrollment.student?.firstName,
                          enrollment.student?.lastName,
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-slate-700">
                        {enrollment.student?.studentCode ?? "—"}
                      </TableCell>
                      <TableCell
                        className="max-w-[160px] truncate text-sm text-slate-700"
                        title={formatBranchLabel(enrollment.branch)}
                      >
                        {formatBranchLabel(enrollment.branch)}
                      </TableCell>
                      <TableCell
                        className="max-w-[180px] truncate text-sm text-slate-700"
                        title={enrollment.student?.email ?? undefined}
                      >
                        {enrollment.student?.email ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm text-slate-700">
                        {enrollment.student?.phone ?? "—"}
                      </TableCell>
                      <TableCell>
                        <EnrollmentStatusBadge status={enrollment.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={enrollmentManagePath(enrollment.id)}
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
              total={totalCount}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          </div>
        )}
      </div>
    </BatchManageSection>
  );
}
