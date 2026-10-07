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

const PAGE_SIZE = 10;

export function BannersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<BannerStatus | "">("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
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
      pageSize: PAGE_SIZE,
    }),
    [page, search, status, type],
  );

  const query = useQuery({
    queryKey: ["admin-banners", filters],
    queryFn: () => bannerService.list(filters),
  });

  const items = query.data?.data ?? [];
  const total = query.data?.meta.total ?? 0;
  const catalogTotal = query.data?.meta.catalogTotal ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
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
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-xs uppercase tracking-wide text-[#647A9B]">
                <tr>
                  <th className="px-3 py-2 font-semibold">Banner Name</th>
                  <th className="px-3 py-2 font-semibold">Type</th>
                  <th className="px-3 py-2 font-semibold">Total Images</th>
                  <th className="px-3 py-2 font-semibold">Status</th>
                  <th className="px-3 py-2 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-slate-500">
                      No banners match your filters.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="border-b border-slate-50">
                      <td className="px-3 py-3 font-medium text-[#0B1F3A]">
                        {item.name}
                      </td>
                      <td className="px-3 py-3 text-slate-600">
                        {getBannerPlacementLabel(item.type)}
                      </td>
                      <td className="px-3 py-3 text-slate-600">
                        {item.imageCount}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={
                            item.status === "ACTIVE"
                              ? "rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700"
                              : "rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600"
                          }
                        >
                          {item.status === "ACTIVE" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex justify-end gap-2">
                          <Tooltip
                            content={
                              item.status === "ACTIVE"
                                ? "Deactivate"
                                : "Activate"
                            }
                          >
                            <button
                              type="button"
                              aria-label="Change status"
                              className="text-[#2563EB]"
                              onClick={() => setPendingStatus(item)}
                            >
                              <Power className="h-4 w-4" />
                            </button>
                          </Tooltip>
                          <Tooltip content="Edit">
                            <button
                              type="button"
                              aria-label="Edit banner"
                              className="text-[#0B1F3A]"
                              onClick={() => {
                                setEditingId(item.id);
                                setFormOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          </Tooltip>
                          <Tooltip content="Delete">
                            <button
                              type="button"
                              aria-label="Delete banner"
                              className="text-red-700"
                              onClick={() => setPendingDelete(item)}
                            >
                              <Trash2 className="h-4 w-4" />
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
        ) : null}

        {totalPages > 1 ? (
          <div className="mt-3">
            <CategoryPagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
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
            ? `${pendingStatus.name} will ${
                pendingStatus.status === "ACTIVE"
                  ? "stop appearing"
                  : "start appearing"
              } on the customer homepage.`
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
