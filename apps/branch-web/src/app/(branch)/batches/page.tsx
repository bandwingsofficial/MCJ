"use client";

import { useEffect, useMemo, useState } from "react";
import { LayoutGrid, List } from "lucide-react";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import { FacultyBatchCard } from "@/src/features/branch-ops/components/batches/faculty-batch-card";
import type { BatchListItem } from "@/src/features/branch-ops/types";
import {
  assignedLabel,
  courseTitle,
  formatBatchDate,
  formatBatchMode,
  formatBatchStatus,
  formatBatchTiming,
  statusBadgeVariant,
  trainerNames,
} from "@/src/features/branch-ops/utils/batch-display";
import { formatRoleLabel } from "@/src/core/auth/roles";
import { useAuthStore } from "@/src/features/auth/store/auth.store";
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
import { cn } from "@/src/shared/lib/cn";
import Link from "next/link";

const VIEW_KEY = "mcj.branch.batches.view";

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
      if (status !== "ALL" && batch.status !== status) return false;
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

  const setViewMode = (next: "grid" | "list") => {
    setView(next);
    window.localStorage.setItem(VIEW_KEY, next);
  };

  return (
    <div className="space-y-5">
      <ListPageHeader
        parentLabel={formatRoleLabel(role) || "Branch"}
        currentLabel="Batches"
        title="Batches"
        totalLabel="Total Batches"
        total={loading || error ? null : items.length}
        filters={
          <>
            <div className="w-full sm:w-[260px]">
              <SearchInput
                value={search}
                placeholder="Search batches..."
                className="h-[46px] rounded-xl"
                onChange={(value) => {
                  setSearch(value);
                  setPage(1);
                }}
              />
            </div>
            <div className="w-full sm:w-[160px]">
              <AppSelect
                value={status}
                triggerClassName="h-[46px] rounded-xl"
                onValueChange={(value) => {
                  setStatus(value);
                  setPage(1);
                }}
                options={[
                  { label: "All Status", value: "ALL" },
                  { label: "Upcoming", value: "UPCOMING" },
                  { label: "Ongoing", value: "ONGOING" },
                  { label: "Completed", value: "COMPLETED" },
                ]}
              />
            </div>
            <div className="flex h-[46px] overflow-hidden rounded-xl border border-[#DCE8F5] bg-white">
              <button
                type="button"
                aria-label="Grid view"
                className={cn(
                  "flex w-12 items-center justify-center",
                  view === "grid"
                    ? "bg-[#E8F1FF] text-[#2563EB]"
                    : "text-[#647A9B]",
                )}
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="List view"
                className={cn(
                  "flex w-12 items-center justify-center border-l border-[#DCE8F5]",
                  view === "list"
                    ? "bg-[#E8F1FF] text-[#2563EB]"
                    : "text-[#647A9B]",
                )}
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </>
        }
      />

      {loading ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 rounded-2xl border border-[#E1EBF5] bg-white py-16">
          <Loader />
          <p className="text-sm text-[#647A9B]">Loading batches...</p>
        </div>
      ) : error ? (
        <ErrorState
          title="Unable to load batches"
          description={error || "Unable to load batches. Please try again."}
          onRetry={reload}
        />
      ) : !items.length ? (
        <EmptyState
          title={
            isFaculty
              ? "No batches are currently assigned to you."
              : "No batches found for this branch."
          }
        />
      ) : view === "grid" ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {paged.map((batch) => (
              <FacultyBatchCard key={batch.id} batch={batch} />
            ))}
          </div>
          <div className="overflow-hidden rounded-2xl border border-[#E1EBF5] bg-white">
            <TablePaginationBar
              page={page}
              pageSize={pageSize}
              total={items.length}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          </div>
        </>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#E1EBF5] bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Trainer</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Start date</TableHead>
                <TableHead>End date</TableHead>
                <TableHead>Timing</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((batch: BatchListItem) => (
                <TableRow key={batch.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-[#102A56]">{batch.name}</p>
                      <p className="font-mono text-xs text-[#647A9B]">
                        {batch.code}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{courseTitle(batch.course)}</TableCell>
                  <TableCell>
                    {assignedLabel(trainerNames(batch.trainers))}
                  </TableCell>
                  <TableCell>{formatBatchMode(batch.mode)}</TableCell>
                  <TableCell>{formatBatchDate(batch.startDate)}</TableCell>
                  <TableCell>{formatBatchDate(batch.endDate)}</TableCell>
                  <TableCell>
                    {formatBatchTiming(batch.startTime, batch.endTime)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariant(batch.status)}>
                      {formatBatchStatus(batch.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{batch.enrolledStudents}</TableCell>
                  <TableCell>
                    <Link
                      href={`/batches/${batch.id}`}
                      className="text-sm font-medium text-[#2563EB] hover:underline"
                    >
                      Manage
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePaginationBar
            page={page}
            pageSize={pageSize}
            total={items.length}
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
