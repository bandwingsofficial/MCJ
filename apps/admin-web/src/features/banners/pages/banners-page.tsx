"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BANNER_MAX_GROUPS,
  BANNER_PLACEMENTS,
  getBannerPlacementLabel,
} from "@mcj/shared-constants";
import { ChevronRight, Pencil, Plus, Power, Trash2 } from "lucide-react";

import { CategoryPagination } from "@/src/features/categories/components/category-pagination";
import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { SearchInput } from "@/src/shared/components/ui/search-input";
import { AppSelect } from "@/src/shared/components/ui/select";
import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";
import { Tooltip } from "@/src/shared/components/ui/tooltip";
import { appToast } from "@/src/shared/components/ui/toast";

import { BannerFormModal } from "@/src/features/banners/components/banner-form-modal";
import { bannerService } from "@/src/features/banners/services/banner.service";
import type {
  BannerListItem,
  BannerStatus,
} from "@/src/features/banners/types/banner.types";

const PAGE_SIZES = [10, 20, 50, 100];

const iconButtonClass =
  "inline-flex h-5 w-5 shrink-0 items-center justify-center border-0 bg-transparent p-0 leading-none transition-colors hover:opacity-80";

const iconClass = "h-[15px] w-[14px] stroke-[2]";

export function BannersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<BannerStatus | "">("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingStatus, setPendingStatus] = useState<BannerListItem | null>(
    null,
  );
  const [pendingDelete, setPendingDelete] = useState<BannerListItem | null>(
    null,
  );
  const [acting, setActing] = useState(false);

  const filters = useMemo(
    () => ({
      search: search.trim(),
      status: status || undefined,
      type: type ? ("HOMEPAGE" as const) : undefined,
      page,
      pageSize,
    }),
    [page, pageSize, search, status, type],
  );

  const query = useQuery({
    queryKey: ["admin-banners", filters],
    queryFn: () => bannerService.list(filters),
  });

  const items = query.data?.data ?? [];
  const total = query.data?.meta.total ?? 0;
  const catalogTotal = query.data?.meta.catalogTotal ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const limitReached = catalogTotal >= BANNER_MAX_GROUPS;

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
  };

  const confirmStatus = async () => {
    if (!pendingStatus) {
      return;
    }

    setActing(true);
    try {
      const nextStatus =
        pendingStatus.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      const response = await bannerService.setStatus(
        pendingStatus.id,
        nextStatus,
      );
      appToast.success(response.message);
      setPendingStatus(null);
      await refresh();
    } catch (error) {
      appToast.error(bannerService.getError(error));
    } finally {
      setActing(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) {
      return;
    }

    setActing(true);
    try {
      const response = await bannerService.remove(pendingDelete.id);
      appToast.success(response.message);
      setPendingDelete(null);
      await refresh();
    } catch (error) {
      appToast.error(bannerService.getError(error));
    } finally {
      setActing(false);
    }
  };

  return (
    <div className="space-y-4">
      <header className="px-1 py-1">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs">
          <Link href="/dashboard" className="text-[#647A9B] hover:text-[#2563EB]">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="font-medium text-[#102A56]">Banner Management</span>
        </nav>
        <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#0B1F3A]">
              Banner Management
            </h1>
            <p className="text-sm text-[#647A9B]">
              {catalogTotal} of {BANNER_MAX_GROUPS} banners
            </p>
          </div>
          <Button
            type="button"
            disabled={limitReached}
            className="border-0 bg-gradient-to-r from-[#0EA5E9] to-[#2563EB] text-white"
            onClick={() => {
              setEditingId(null);
              setFormOpen(true);
            }}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add Banner
          </Button>
        </div>
        {limitReached ? (
          <p className="mt-2 text-xs text-amber-700">
            The maximum of {BANNER_MAX_GROUPS} banners has been reached.
          </p>
        ) : null}
      </header>

      <Card className="rounded-xl border-[#E1EBF5] p-3 shadow-sm">
        <div className="mb-3 grid gap-2 md:grid-cols-[1fr_180px_180px]">
          <SearchInput
            value={search}
            placeholder="Search banners"
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
          />
          <AppSelect
            value={status || "ALL"}
            options={[
              { value: "ALL", label: "All statuses" },
              { value: "ACTIVE", label: "Active" },
              { value: "INACTIVE", label: "Inactive" },
            ]}
            onValueChange={(value) => {
              setStatus(value === "ALL" ? "" : (value as BannerStatus));
              setPage(1);
            }}
          />
          <AppSelect
            value={type || "ALL"}
            options={[
              { value: "ALL", label: "All types" },
              ...BANNER_PLACEMENTS.map((item) => ({
                value: item.value,
                label: item.label,
              })),
            ]}
            onValueChange={(value) => {
              setType(value === "ALL" ? "" : value);
              setPage(1);
            }}
          />
        </div>

        {query.isLoading ? <SkeletonTable /> : null}
        {query.isError ? (
          <ErrorState
            title="Unable to load banners"
            description={bannerService.getError(query.error)}
            onRetry={() => void query.refetch()}
          />
        ) : null}

        {!query.isLoading && !query.isError ? (
          <>
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-full border-collapse text-sm">
                <thead className="sticky top-0 z-10 border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] text-[#526581]">
                  <tr>
                    <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide">
                      Banner Name
                    </th>
                    <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide">
                      Type
                    </th>
                    <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide">
                      Total Images
                    </th>
                    <th className="w-24 !px-4 !py-4 text-left text-[11px] font-semibold tracking-wide">
                      Status
                    </th>
                    <th className="w-[6.75rem] !px-4 !py-4 text-right text-[11px] font-semibold tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="!px-4 !py-4 align-middle">
                        <div className="flex min-h-[120px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 px-4 py-4 text-center">
                          <h3 className="text-base font-semibold text-[#102A56]">
                            No Banners Found
                          </h3>
                          <p className="mt-1 max-w-md text-sm text-[#647A9B]">
                            {catalogTotal === 0
                              ? "Create your first banner for the homepage."
                              : "No banners match your filters."}
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
                          <p className="text-sm font-medium leading-snug text-[#102A56]">
                            {item.name}
                          </p>
                        </td>
                        <td className="!px-4 !py-4 align-middle text-sm text-[#526581]">
                          {getBannerPlacementLabel(item.type)}
                        </td>
                        <td className="!px-4 !py-4 align-middle text-sm text-[#526581]">
                          {item.imageCount}
                        </td>
                        <td className="!px-4 !py-4 align-middle">
                          <Badge
                            variant={item.status === "ACTIVE" ? "success" : "default"}
                            className="px-2 py-0 text-[11px] font-semibold leading-5"
                          >
                            {item.status === "ACTIVE" ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="!px-4 !py-4 align-middle">
                          <div className="flex items-center justify-end gap-2">
                            <Tooltip
                              content={
                                item.status === "ACTIVE" ? "Deactivate" : "Activate"
                              }
                            >
                              <button
                                type="button"
                                aria-label={
                                  item.status === "ACTIVE"
                                    ? "Deactivate banner"
                                    : "Activate banner"
                                }
                                className={`${iconButtonClass} text-[#2563EB]`}
                                onClick={() => setPendingStatus(item)}
                              >
                                <Power className={iconClass} />
                              </button>
                            </Tooltip>
                            <Tooltip content="Edit">
                              <button
                                type="button"
                                aria-label="Edit banner"
                                className={`${iconButtonClass} text-[#0B1F3A]`}
                                onClick={() => {
                                  setEditingId(item.id);
                                  setFormOpen(true);
                                }}
                              >
                                <Pencil className={iconClass} />
                              </button>
                            </Tooltip>
                            <Tooltip content="Delete">
                              <button
                                type="button"
                                aria-label="Delete banner"
                                className={`${iconButtonClass} text-red-800`}
                                onClick={() => setPendingDelete(item)}
                              >
                                <Trash2 className={iconClass} />
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

            <div className="mt-3 flex flex-col gap-1.5 border-t border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
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
                    {PAGE_SIZES.map((size) => (
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
          </>
        ) : null}
      </Card>

      <BannerFormModal
        open={formOpen}
        bannerId={editingId}
        onClose={() => setFormOpen(false)}
        onSaved={() => void refresh()}
      />

      <ConfirmDialog
        open={Boolean(pendingStatus)}
        title={
          pendingStatus?.status === "ACTIVE"
            ? "Deactivate banner?"
            : "Activate banner?"
        }
        description={
          pendingStatus
            ? pendingStatus.status === "ACTIVE"
              ? `${pendingStatus.name} will stop appearing on the homepage. The default hero is used when no banner is active.`
              : `${pendingStatus.name} will become the only active banner. Any banner that is currently active will be set to inactive.`
            : ""
        }
        confirmLabel={
          pendingStatus?.status === "ACTIVE" ? "Deactivate" : "Activate"
        }
        loading={acting}
        onCancel={() => setPendingStatus(null)}
        onConfirm={() => void confirmStatus()}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete banner permanently?"
        description={
          pendingDelete
            ? `${pendingDelete.name} and its images will be permanently deleted. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        loading={acting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
