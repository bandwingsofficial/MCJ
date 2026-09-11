"use client";

import { useMemo } from "react";

import { CategoryPagination } from "@/src/features/categories/components/category-pagination";

interface Props {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function ModuleContentPagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const pageSizeOptions = useMemo(() => [10, 20, 50], []);

  if (total === 0) {
    return null;
  }

  return (
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
              onPageSizeChange(Number(event.target.value));
              onPageChange(1);
            }}
          >
            {pageSizeOptions.map((size) => (
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
        onPageChange={onPageChange}
      />
    </div>
  );
}

export function paginateRows<T>(rows: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize;
  return rows.slice(start, start + pageSize);
}

export function matchesArchivedFilter(
  isArchived: boolean,
  status: string,
) {
  if (status === "ALL") {
    return true;
  }
  if (status === "INACTIVE" || status === "ARCHIVED") {
    return isArchived;
  }
  return !isArchived;
}
