"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Eye } from "lucide-react";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import { EnrollmentStatusBadge } from "@/src/features/enrollments/components/enrollment-status-badge";
import { formatRoleLabel } from "@/src/core/auth/roles";
import { useAuthStore } from "@/src/features/auth/store/auth.store";
import { CategoryPagination } from "@/src/shared/components/ui/category-pagination";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { SearchInput } from "@/src/shared/components/ui/search-input";
import { AppSelect } from "@/src/shared/components/ui/select";
import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";
import { Tooltip } from "@/src/shared/components/ui/tooltip";
import { useAsyncData } from "@/src/shared/hooks/use-async-data";

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

const iconButtonClass =
  "inline-flex h-5 w-5 shrink-0 items-center justify-center border-0 bg-transparent p-0 leading-none transition-colors hover:opacity-80";

const iconClass = "h-[15px] w-[14px] stroke-[2]";

const columnCount = 7;

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
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="space-y-3">
      <header className="px-1 py-1">
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
          <div className="min-w-0 space-y-1">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-1 text-xs"
            >
              <Link
                href="/dashboard"
                className="text-[#647A9B] transition-colors hover:text-[#2563EB]"
              >
                {formatRoleLabel(role) || "Branch"}
              </Link>
              <ChevronRight
                className="h-3.5 w-3.5 text-slate-400"
                aria-hidden="true"
              />
              <span aria-current="page" className="font-medium text-[#102A56]">
                Student Enrollments
              </span>
            </nav>

            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
              <h1 className="text-[22px] font-bold tracking-tight text-[#102A56] sm:text-[26px]">
                Student Enrollments
              </h1>
              <span className="text-xs text-[#647A9B] sm:text-[13px]">
                Total Enrolled:
                <span className="ml-1 font-semibold tabular-nums text-[#647A9B]">
                  {query.loading || query.error ? "—" : total}
                </span>
              </span>
            </div>
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center lg:w-auto lg:shrink-0">
            <div className="w-full sm:w-[280px]">
              <SearchInput
                value={search}
                placeholder="Search enrollments..."
                className="h-9 rounded-lg !py-1.5 pl-9 text-sm"
                onChange={setSearch}
              />
            </div>
            <div className="w-full sm:w-[200px]">
              <AppSelect
                value={batchId}
                triggerClassName="h-9 rounded-lg px-2.5 text-sm"
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
                triggerClassName="h-9 rounded-lg px-2.5 text-sm"
                onValueChange={(value) => {
                  setStatus(value);
                  setPage(1);
                }}
                options={STATUS_OPTIONS}
              />
            </div>
          </div>
        </div>
      </header>

      {query.loading ? (
        <div className="overflow-hidden rounded-xl border border-[#E1EBF5] bg-white p-0 shadow-sm">
          <SkeletonTable rows={8} />
        </div>
      ) : query.error ? (
        <ErrorState description={query.error} onRetry={query.reload} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#E1EBF5] bg-white p-0 shadow-sm">
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-full border-collapse text-sm">
              <thead className="sticky top-0 z-10 border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] text-[#526581]">
                <tr>
                  <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
                    Student
                  </th>
                  <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
                    Enrollment number
                  </th>
                  <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
                    Batch
                  </th>
                  <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
                    Course
                  </th>
                  <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
                    Enrollment date
                  </th>
                  <th className="w-24 !px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
                    Status
                  </th>
                  <th className="w-[4.5rem] !px-8 !py-4 text-right text-[11px] font-semibold tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columnCount}
                      className="!px-4 !py-4 align-middle"
                    >
                      <div className="flex min-h-[120px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 px-4 py-4 text-center">
                        <h3 className="text-base font-semibold">
                          No Enrollments Found
                        </h3>
                        <p className="mt-1 max-w-md text-sm text-[#647A9B]">
                          No enrollments found. Adjust your search or filters.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-slate-100 bg-white transition-colors hover:bg-slate-50"
                    >
                      <td className="!px-4 !py-4 align-middle">
                        <div className="min-w-0">
                          <p className="text-sm font-medium leading-snug text-[#102A56]">
                            {[item.student.firstName, item.student.lastName]
                              .filter(Boolean)
                              .join(" ")}
                          </p>
                          <p className="text-xs text-[#647A9B]">
                            {item.student.email || item.student.phone || "—"}
                          </p>
                        </div>
                      </td>
                      <td className="!px-4 !py-4 align-middle text-sm text-slate-700">
                        {item.enrollmentNumber}
                      </td>
                      <td className="!px-4 !py-4 align-middle text-sm text-slate-700">
                        {item.batch?.name ?? "—"}
                      </td>
                      <td className="!px-4 !py-4 align-middle text-sm text-slate-700">
                        {item.course?.title ?? "—"}
                      </td>
                      <td className="!px-4 !py-4 align-middle text-sm text-slate-700">
                        {item.enrollmentDate
                          ? String(item.enrollmentDate).slice(0, 10)
                          : "—"}
                      </td>
                      <td className="!px-4 !py-4 align-middle">
                        <EnrollmentStatusBadge status={item.status} />
                      </td>
                      <td className="!px-8 !py-4 text-right align-middle">
                        <div className="flex items-center justify-end gap-2">
                          <Tooltip content="View">
                            <Link
                              href={`/students/${item.student.id}`}
                              className={`${iconButtonClass} text-blue-900`}
                              aria-label="View"
                            >
                              <Eye className={iconClass} />
                            </Link>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-1.5 border-t border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#647A9B] sm:text-sm">
              <span>
                Showing {from}–{to} of {total}
              </span>
              <label className="flex items-center gap-1.5">
                <span className="whitespace-nowrap">Rows per page</span>
                <select
                  className="h-7 rounded-md border border-[#DCE8F5] bg-white px-1.5 text-xs text-[#102A56] sm:text-sm"
                  value={pageSize}
                  onChange={(event) => {
                    setPageSize(Number(event.target.value));
                    setPage(1);
                  }}
                >
                  {[10, 20, 50, 100].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <CategoryPagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </div>
      )}
    </div>
  );
}
