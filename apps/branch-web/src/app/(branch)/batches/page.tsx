"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, LayoutGrid, List, Settings2 } from "lucide-react";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import { FacultyBatchCard } from "@/src/features/branch-ops/components/batches/faculty-batch-card";
import { BatchStatusBadge } from "@/src/features/branch-ops/components/batches/batch-status-badge";
import type { BatchListItem } from "@/src/features/branch-ops/types";
import {
  assignedLabel,
  courseTitle,
  formatBatchDate,
  formatBatchMode,
  formatBatchTiming,
  getBatchDisplayStatus,
  isBatchLifecycleGreyed,
  trainerNames,
} from "@/src/features/branch-ops/utils/batch-display";
import { formatRoleLabel } from "@/src/core/auth/roles";
import { useAuthStore } from "@/src/features/auth/store/auth.store";
import { CategoryPagination } from "@/src/shared/components/ui/category-pagination";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { SearchInput } from "@/src/shared/components/ui/search-input";
import { AppSelect } from "@/src/shared/components/ui/select";
import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";
import { Tooltip } from "@/src/shared/components/ui/tooltip";
import { useAsyncData } from "@/src/shared/hooks/use-async-data";
import { cn } from "@/src/shared/lib/cn";

const VIEW_KEY = "mcj.branch.batches.view";

const iconButtonClass =
  "inline-flex h-5 w-5 shrink-0 items-center justify-center border-0 bg-transparent p-0 leading-none transition-colors hover:opacity-80";

const iconClass = "h-[15px] w-[14px] stroke-[2]";

const columnCount = 10;

export default function BatchesPage() {
  const role = useAuthStore((state) => state.user?.role);
  const isFaculty = role === "FACULTY";
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [view, setView] = useState<"grid" | "list">(isFaculty ? "grid" : "list");

  useEffect(() => {
    const stored = window.localStorage.getItem(VIEW_KEY);
    if (stored === "list" || stored === "grid") {
      setView(stored);
    } else if (!isFaculty) {
      setView("list");
    }
  }, [isFaculty]);

  const { data, loading, error, reload } = useAsyncData(
    () => branchOpsApi.batches(),
    [],
  );

  const items = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (data ?? []).filter((batch) => {
      if (status !== "ALL") {
        const display = getBatchDisplayStatus(batch);
        if (status === "EXPIRED") {
          if (display.key !== "EXPIRED") return false;
        } else if (status === "COMPLETED") {
          if (display.key !== "COMPLETED") return false;
        } else if (batch.status !== status) {
          return false;
        }
      }
      if (!term) return true;
      const haystack = [
        batch.name,
        batch.code,
        batch.course?.title,
        batch.course?.name,
        trainerNames(batch.trainers),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [data, search, status]);

  const paged = items.slice((page - 1) * pageSize, page * pageSize);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const setViewMode = (next: "grid" | "list") => {
    setView(next);
    window.localStorage.setItem(VIEW_KEY, next);
  };

  const emptyTitle = isFaculty
    ? "No batches are currently assigned to you."
    : "No batches found for this branch.";

  const emptyDescription = isFaculty
    ? "Assigned batches will appear here when available."
    : "Create or assign batches, or adjust your filters.";

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
                Batches
              </span>
            </nav>

            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
              <h1 className="text-[22px] font-bold tracking-tight text-[#102A56] sm:text-[26px]">
                Batches
              </h1>
              <span className="text-xs text-[#647A9B] sm:text-[13px]">
                Total Batches:
                <span className="ml-1 font-semibold tabular-nums text-[#647A9B]">
                  {loading || error ? "—" : total}
                </span>
              </span>
            </div>
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center lg:w-auto lg:shrink-0">
            <div className="w-full sm:w-[280px]">
              <SearchInput
                value={search}
                placeholder="Search batches..."
                className="h-9 rounded-lg !py-1.5 pl-9 text-sm"
                onChange={(value) => {
                  setSearch(value);
                  setPage(1);
                }}
              />
            </div>

            <div className="w-full sm:w-[140px]">
              <AppSelect
                value={status}
                triggerClassName="h-9 rounded-lg px-2.5 text-sm"
                onValueChange={(value) => {
                  setStatus(value);
                  setPage(1);
                }}
                options={[
                  { label: "All Status", value: "ALL" },
                  { label: "Upcoming", value: "UPCOMING" },
                  { label: "Ongoing", value: "ONGOING" },
                  { label: "Completed", value: "COMPLETED" },
                  { label: "Expired", value: "EXPIRED" },
                ]}
              />
            </div>

            <div
              className="flex h-9 shrink-0 overflow-hidden rounded-lg border border-[#DCE8F5] bg-white"
              role="group"
              aria-label="View mode"
            >
              <button
                type="button"
                aria-label="Grid view"
                aria-pressed={view === "grid"}
                className={cn(
                  "flex h-9 w-9 items-center justify-center transition-colors",
                  view === "grid"
                    ? "bg-[#102A56] text-white"
                    : "text-[#647A9B] hover:bg-slate-50",
                )}
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4 stroke-[2]" />
              </button>
              <button
                type="button"
                aria-label="List view"
                aria-pressed={view === "list"}
                className={cn(
                  "flex h-9 w-9 items-center justify-center border-l border-[#DCE8F5] transition-colors",
                  view === "list"
                    ? "bg-[#102A56] text-white"
                    : "text-[#647A9B] hover:bg-slate-50",
                )}
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4 stroke-[2]" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="overflow-hidden rounded-xl border border-[#E1EBF5] bg-white p-0 shadow-sm">
          <SkeletonTable rows={8} />
        </div>
      ) : error ? (
        <ErrorState
          title="Unable to load batches"
          description={error || "Unable to load batches. Please try again."}
          onRetry={reload}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#E1EBF5] bg-white p-0 shadow-sm">
          {view === "grid" ? (
            items.length === 0 ? (
              <div className="flex min-h-[120px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center">
                <h3 className="text-base font-semibold">No Batches Found</h3>
                <p className="mt-1 max-w-md text-sm text-[#647A9B]">
                  {emptyTitle}
                </p>
              </div>
            ) : (
              <div className="grid gap-3 p-3 md:grid-cols-2 xl:grid-cols-3">
                {paged.map((batch) => (
                  <FacultyBatchCard key={batch.id} batch={batch} />
                ))}
              </div>
            )
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-full border-collapse text-sm">
                <thead className="sticky top-0 z-10 border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] text-[#526581]">
                  <tr>
                    <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
                      Batch
                    </th>
                    <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
                      Course
                    </th>
                    <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
                      Trainer
                    </th>
                    <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
                      Mode
                    </th>
                    <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
                      Start date
                    </th>
                    <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
                      End date
                    </th>
                    <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
                      Timing
                    </th>
                    <th className="w-24 !px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
                      Status
                    </th>
                    <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
                      Students
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
                            No Batches Found
                          </h3>
                          <p className="mt-1 max-w-md text-sm text-[#647A9B]">
                            {emptyDescription}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paged.map((batch: BatchListItem) => {
                      const greyed = isBatchLifecycleGreyed(batch);

                      return (
                        <tr
                          key={batch.id}
                          className={cn(
                            "border-b border-slate-100 transition-colors hover:bg-slate-50",
                            greyed
                              ? "bg-slate-50/40 text-slate-500"
                              : "bg-white",
                          )}
                        >
                          <td className="!px-4 !py-4 align-middle">
                            <div className="min-w-0">
                              <p
                                className={cn(
                                  "truncate text-sm font-medium leading-snug",
                                  greyed ? "text-slate-400" : "text-[#102A56]",
                                )}
                              >
                                {batch.name}
                              </p>
                              <p className="font-mono text-xs text-[#647A9B]">
                                {batch.code}
                              </p>
                            </div>
                          </td>
                          <td
                            className={cn(
                              "!px-4 !py-4 align-middle text-sm",
                              greyed ? "text-slate-400" : "text-slate-700",
                            )}
                          >
                            {courseTitle(batch.course)}
                          </td>
                          <td
                            className={cn(
                              "!px-4 !py-4 align-middle text-sm",
                              greyed ? "text-slate-400" : "text-slate-700",
                            )}
                          >
                            {assignedLabel(trainerNames(batch.trainers))}
                          </td>
                          <td
                            className={cn(
                              "!px-4 !py-4 align-middle text-sm",
                              greyed ? "text-slate-400" : "text-slate-700",
                            )}
                          >
                            {formatBatchMode(batch.mode)}
                          </td>
                          <td
                            className={cn(
                              "!px-4 !py-4 align-middle text-sm",
                              greyed ? "text-slate-400" : "text-slate-700",
                            )}
                          >
                            {formatBatchDate(batch.startDate)}
                          </td>
                          <td
                            className={cn(
                              "!px-4 !py-4 align-middle text-sm",
                              greyed ? "text-slate-400" : "text-slate-700",
                            )}
                          >
                            {formatBatchDate(batch.endDate)}
                          </td>
                          <td
                            className={cn(
                              "!px-4 !py-4 align-middle text-sm",
                              greyed ? "text-slate-400" : "text-slate-700",
                            )}
                          >
                            {formatBatchTiming(batch.startTime, batch.endTime)}
                          </td>
                          <td className="!px-4 !py-4 align-middle">
                            <BatchStatusBadge status={batch.status} />
                          </td>
                          <td
                            className={cn(
                              "!px-4 !py-4 align-middle text-sm tabular-nums",
                              greyed ? "text-slate-400" : "text-slate-700",
                            )}
                          >
                            {batch.enrolledStudents}
                          </td>
                          <td className="!px-8 !py-4 text-right align-middle">
                            <div className="flex items-center justify-end gap-2">
                              <Tooltip content="Manage batch">
                                <Link
                                  href={`/batches/${batch.id}`}
                                  className={`${iconButtonClass} text-blue-900`}
                                  aria-label="Manage batch"
                                >
                                  <Settings2 className={iconClass} />
                                </Link>
                              </Tooltip>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

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
