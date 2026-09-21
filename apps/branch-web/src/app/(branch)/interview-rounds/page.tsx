"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Archive,
  ChevronRight,
  CircleCheck,
  Pencil,
  Plus,
  Power,
} from "lucide-react";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import {
  parseBranchOpsError,
  userFacingApiMessage,
} from "@/src/features/branch-ops/api/parse-api-error";
import type { InterviewRoundItem } from "@/src/features/branch-ops/types";
import { BranchInterviewRoundFormModal } from "@/src/features/interviews/components/BranchInterviewRoundFormModal";
import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";
import { CategoryPagination } from "@/src/shared/components/ui/category-pagination";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { SearchInput } from "@/src/shared/components/ui/search-input";
import { AppSelect } from "@/src/shared/components/ui/select";
import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";
import { Tooltip } from "@/src/shared/components/ui/tooltip";
import { useAsyncData } from "@/src/shared/hooks/use-async-data";
import { cn } from "@/src/shared/lib/cn";
import { appToast } from "@/src/shared/lib/toast";

const iconButtonClass =
  "inline-flex h-5 w-5 shrink-0 items-center justify-center border-0 bg-transparent p-0 leading-none transition-colors hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40";

const iconClass = "h-[15px] w-[14px] stroke-[2]";

const compactBadgeClass = "px-2 py-0 text-[11px] font-semibold leading-5";

const COLUMN_COUNT = 5;

function RoundStatusBadge({ status }: { status: string }) {
  if (status === "ACTIVE") {
    return (
      <Badge variant="success" className={compactBadgeClass}>
        Active
      </Badge>
    );
  }

  return (
    <Badge
      variant="warning"
      className={cn(compactBadgeClass, "bg-orange-50 text-orange-800")}
    >
      Inactive
    </Badge>
  );
}

export default function InterviewRoundsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<InterviewRoundItem | null>(null);
  const [confirm, setConfirm] = useState<{
    type: "activate" | "deactivate" | "delete";
    round: InterviewRoundItem;
  } | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [search]);

  const query = useAsyncData(
    () =>
      branchOpsApi.interviewRounds({
        search: debouncedSearch || undefined,
        status: status === "ALL" ? "ALL" : (status as "ACTIVE" | "INACTIVE"),
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    [debouncedSearch, status, page, pageSize],
  );

  const items = query.data?.items ?? [];
  const total = query.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const runConfirm = async () => {
    if (!confirm) return;
    try {
      setConfirmLoading(true);
      if (confirm.type === "activate") {
        await branchOpsApi.updateInterviewRound(confirm.round.id, {
          status: "ACTIVE",
        });
        appToast.success("Round activated");
      } else if (confirm.type === "deactivate") {
        await branchOpsApi.updateInterviewRound(confirm.round.id, {
          status: "INACTIVE",
        });
        appToast.success("Round deactivated");
      } else {
        await branchOpsApi.deleteInterviewRound(confirm.round.id);
        appToast.success("Round deleted");
      }
      setConfirm(null);
      await query.reload();
    } catch (error) {
      appToast.error(userFacingApiMessage(parseBranchOpsError(error)));
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <header className="px-1 py-1">
        <nav
          aria-label="Breadcrumb"
          className="mb-1 flex items-center gap-1 text-xs"
        >
          <Link
            href="/dashboard"
            className="text-[#647A9B] transition-colors hover:text-[#2563EB]"
          >
            Branch Manager
          </Link>
          <ChevronRight
            className="h-3.5 w-3.5 text-slate-400"
            aria-hidden="true"
          />
          <span aria-current="page" className="font-medium text-[#102A56]">
            Interview Rounds
          </span>
        </nav>

        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:gap-4">
          <div className="flex shrink-0 flex-wrap items-baseline gap-x-3 gap-y-0.5">
            <h1 className="text-[22px] font-bold tracking-tight text-[#102A56] sm:text-[26px]">
              Interview Rounds
            </h1>
            <span className="text-xs text-[#647A9B] sm:text-[13px]">
              Total Rounds:
              <span className="ml-1 font-semibold tabular-nums text-[#647A9B]">
                {query.loading ? "—" : total}
              </span>
            </span>
          </div>

          <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-center lg:ml-auto lg:w-auto lg:flex-1 lg:justify-end">
            <div className="w-full sm:w-[280px]">
              <SearchInput
                value={search}
                placeholder="Search rounds..."
                className="h-9 rounded-lg !py-1.5 pl-9 text-sm"
                onChange={setSearch}
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
                  { label: "Active", value: "ACTIVE" },
                  { label: "Inactive", value: "INACTIVE" },
                ]}
              />
            </div>
            <Button
              type="button"
              className="h-11 w-full shrink-0 border-0 bg-gradient-to-r from-[#0EA5E9] to-[#2563EB] px-6 text-sm font-semibold text-white shadow-[0_3px_10px_rgba(37,99,235,0.25)] transition-all hover:from-[#0284C7] hover:to-[#1D4ED8] hover:shadow-[0_4px_12px_rgba(37,99,235,0.3)] sm:w-auto"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus className="mr-1 h-4 w-4" aria-hidden="true" />
              Create Round
            </Button>
          </div>
        </div>
      </header>

      {query.loading ? (
        <div className="min-w-0 overflow-hidden rounded-xl border border-[#E1EBF5] bg-white p-0 shadow-sm">
          <SkeletonTable rows={8} />
        </div>
      ) : query.error ? (
        <ErrorState description={query.error} onRetry={query.reload} />
      ) : (
        <div className="min-w-0 overflow-hidden rounded-xl border border-[#E1EBF5] bg-white p-0 shadow-sm">
          <div className="w-full min-w-0 overflow-x-auto">
            <table className="w-full table-fixed border-collapse text-sm">
              <colgroup>
                <col className="w-[22%]" />
                <col className="w-20" />
                <col className="w-[36%]" />
                <col className="w-24" />
                <col className="w-[8.5rem]" />
              </colgroup>
              <thead className="sticky top-0 z-10 border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] text-[#526581]">
                <tr>
                  <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
                    Round Name
                  </th>
                  <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
                    Order
                  </th>
                  <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
                    Description
                  </th>
                  <th className="w-24 !px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
                    Status
                  </th>
                  <th className="w-[8.5rem] !px-4 !py-4 text-right text-[11px] font-semibold tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={COLUMN_COUNT}
                      className="!px-4 !py-4 align-middle"
                    >
                      <div className="flex min-h-[120px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 px-4 py-4 text-center">
                        <h3 className="text-base font-semibold">
                          No Interview Rounds Found
                        </h3>
                        <p className="mt-1 max-w-md text-sm text-[#647A9B]">
                          Create your first interview round or adjust your
                          filters.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  items.map((round) => (
                    <tr
                      key={round.id}
                      className="border-b border-slate-100 bg-white transition-colors hover:bg-slate-50"
                    >
                      <td className="!px-4 !py-4 align-middle">
                        <span
                          className="truncate text-sm font-medium leading-snug text-[#102A56]"
                          title={round.name}
                        >
                          {round.name}
                        </span>
                      </td>
                      <td className="!px-4 !py-4 align-middle text-sm tabular-nums text-slate-700">
                        {round.sortOrder}
                      </td>
                      <td className="!px-4 !py-4 align-middle text-sm text-slate-700">
                        <span
                          className="block truncate"
                          title={round.description || undefined}
                        >
                          {round.description || "—"}
                        </span>
                      </td>
                      <td className="!px-4 !py-4 align-middle">
                        <RoundStatusBadge status={round.status} />
                      </td>
                      <td className="!px-4 !py-4 align-middle">
                        <div className="flex items-center justify-end gap-2">
                          <Tooltip
                            content={
                              round.status === "ACTIVE"
                                ? "Deactivate round"
                                : "Activate round"
                            }
                          >
                            <button
                              type="button"
                              className={`${iconButtonClass} text-orange-700`}
                              aria-label={
                                round.status === "ACTIVE"
                                  ? "Deactivate round"
                                  : "Activate round"
                              }
                              onClick={() =>
                                setConfirm({
                                  type:
                                    round.status === "ACTIVE"
                                      ? "deactivate"
                                      : "activate",
                                  round,
                                })
                              }
                            >
                              {round.status === "ACTIVE" ? (
                                <Power className={iconClass} />
                              ) : (
                                <CircleCheck className={iconClass} />
                              )}
                            </button>
                          </Tooltip>

                          <Tooltip content="Edit round">
                            <button
                              type="button"
                              className={`${iconButtonClass} text-blue-900`}
                              aria-label="Edit round"
                              onClick={() => {
                                setEditing(round);
                                setFormOpen(true);
                              }}
                            >
                              <Pencil className={iconClass} />
                            </button>
                          </Tooltip>

                          <Tooltip content="Delete round">
                            <button
                              type="button"
                              className={`${iconButtonClass} text-red-800`}
                              aria-label="Delete round"
                              onClick={() =>
                                setConfirm({
                                  type: "delete",
                                  round,
                                })
                              }
                            >
                              <Archive className={iconClass} />
                            </button>
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

      <BranchInterviewRoundFormModal
        open={formOpen}
        round={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSuccess={() => {
          void query.reload();
        }}
      />

      <ConfirmDialog
        open={Boolean(confirm)}
        title={
          confirm?.type === "activate"
            ? "Activate round"
            : confirm?.type === "delete"
              ? "Delete Round?"
              : "Deactivate round"
        }
        description={
          confirm?.type === "activate"
            ? "This round will be available when scheduling interviews."
            : confirm?.type === "delete"
              ? "This round will be permanently removed. Rounds already used by interviews cannot be deleted."
              : "This round will no longer appear in scheduling dropdowns."
        }
        confirmLabel={
          confirm?.type === "activate"
            ? "Activate"
            : confirm?.type === "delete"
              ? "Delete"
              : "Deactivate"
        }
        confirmVariant={confirm?.type === "activate" ? "primary" : "danger"}
        loading={confirmLoading}
        onConfirm={() => {
          void runConfirm();
        }}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
