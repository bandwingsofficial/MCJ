"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/src/shared/components/ui/button";
import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Pagination } from "@/src/shared/components/ui/pagination";
import { Card } from "@/src/shared/components/ui/card";
import { appToast } from "@/src/shared/components/ui/toast";

import {
  BranchListItem,
} from "@/src/features/branches/types/branch.types";

import { useBranches } from "@/src/features/branches/hooks/use-branches";
import { useUpdateStatus } from "@/src/features/branches/hooks/use-update-status";

import { branchService } from "@/src/features/branches/services/branch.service";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { BranchFilters } from "@/src/features/branches/components/branch-filters";
import { BranchTable } from "@/src/features/branches/components/branch-table";
import { CreateBranchModal } from "@/src/features/branches/components/create-branch-modal";
import { StatusBranchDialog } from "@/src/features/branches/components/status-branch-dialog";

export default function BranchesPage() {
  const router = useRouter();
  const {
    branches,
    total,
    filters,
    setFilters,
    isInitialLoading,
    isFetching,
    error,
    refetch,
  } = useBranches();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  const [selectedBranch, setSelectedBranch] =
    useState<BranchListItem | null>(null);
  const [statusTarget, setStatusTarget] = useState<
    "ACTIVE" | "INACTIVE" | null
  >(null);
  const [isReordering, setIsReordering] = useState(false);

  const { updateStatus, isPending: isUpdatingStatus } =
    useUpdateStatus();

  const pageSize = filters.pageSize ?? 20;
  const page = filters.page ?? 1;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const actionLoading = isUpdatingStatus || isReordering;

  const handleReorder = async (payload: {
    branchId: string;
    newDisplayOrder: number;
  }) => {
    try {
      setIsReordering(true);
      await branchService.reorderBranches(payload);
      appToast.success("Branch order updated");
      await refetch();
    } catch (err) {
      appToast.error(getErrorMessage(err));
      throw err;
    } finally {
      setIsReordering(false);
    }
  };

  if (error && branches.length === 0 && !isInitialLoading) {
    return (
      <ErrorState
        title="Failed To Load Branches"
        description={error}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Branches
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Manage organization branches
          </p>
        </div>

        <Button
          onClick={() => setIsCreateOpen(true)}
          className="h-9 rounded-lg px-4"
        >
          Create Branch
        </Button>
      </div>

      <div className="space-y-3">
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
          <BranchFilters
            filters={filters}
            onChange={setFilters}
          />
        </div>

        {isInitialLoading ? (
          <SkeletonTable rows={10} />
        ) : (
          <Card className="overflow-hidden p-0 shadow-sm">
            {error && (
              <div className="border-b border-red-100 bg-red-50 px-3.5 py-2 text-sm text-red-700">
                {error}{" "}
                <button
                  type="button"
                  className="font-medium underline"
                  onClick={() => {
                    void refetch();
                  }}
                >
                  Retry
                </button>
              </div>
            )}

            <div aria-busy={isFetching} className="relative">
              {isFetching && (
                <span className="sr-only">
                  Updating branches
                </span>
              )}

              <BranchTable
                branches={branches}
                actionsDisabled={
                  actionLoading || isFetching
                }
                reorderDisabled={
                  isReordering ||
                  !!filters.status ||
                  !!(filters.search ?? "").trim() ||
                  isFetching
                }
                onManage={(item) => {
                  router.push(`/branches/${item.id}/manage`);
                }}
                onActivate={(item) => {
                  setSelectedBranch(item);
                  setStatusTarget("ACTIVE");
                  setIsStatusOpen(true);
                }}
                onDeactivate={(item) => {
                  setSelectedBranch(item);
                  setStatusTarget("INACTIVE");
                  setIsStatusOpen(true);
                }}
                onReorder={handleReorder}
              />
            </div>

            <div className="flex min-h-[3.25rem] flex-col gap-2 border-t border-slate-200 px-3.5 py-2.5 sm:flex-row sm:items-center sm:justify-between">
              {total > 0 ? (
                <>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[15px] text-slate-600">
                    <span className="leading-9">
                      Showing {from}–{to} of {total}
                    </span>

                    <label className="flex items-center gap-2 leading-9">
                      <span className="whitespace-nowrap">
                        Rows per page
                      </span>
                      <select
                        className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-[15px]"
                        value={pageSize}
                        onChange={(event) =>
                          setFilters({
                            ...filters,
                            pageSize: Number(
                              event.target.value
                            ),
                          })
                        }
                      >
                        {[10, 20, 50].map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPageChange={(nextPage) =>
                      setFilters({
                        ...filters,
                        page: nextPage,
                      })
                    }
                  />
                </>
              ) : (
                <p className="text-[15px] leading-9 text-slate-500">
                  No branches to paginate
                </p>
              )}
            </div>
          </Card>
        )}
      </div>

      <CreateBranchModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {
          void refetch();
        }}
      />

      <StatusBranchDialog
        open={isStatusOpen}
        branch={selectedBranch}
        isLoading={isUpdatingStatus}
        onClose={() => {
          setIsStatusOpen(false);
          setStatusTarget(null);
        }}
        onConfirm={async () => {
          if (!selectedBranch || !statusTarget) {
            return;
          }

          await updateStatus(
            selectedBranch.id,
            statusTarget
          );
          setIsStatusOpen(false);
          setStatusTarget(null);
          await refetch();
        }}
      />
    </>
  );
}
