"use client";

import { Pagination } from "@/src/shared/components/ui/pagination";

interface TablePaginationBarProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function TablePaginationBar({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: TablePaginationBarProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  if (total === 0) {
    return null;
  }

  return (
    <div className="flex min-h-[3.25rem] flex-col gap-2 border-t border-[#DCE8F5] bg-[#F8FBFF] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[15px] text-[#647A9B]">
        <span className="leading-9">
          Showing {from}–{to} of {total}
        </span>
        <label className="flex items-center gap-2 leading-9">
          <span className="whitespace-nowrap">Rows per page</span>
          <select
            className="h-9 rounded-xl border border-[#DCE8F5] bg-white px-2 text-[15px] text-[#102A56]"
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
          >
            {[10, 20, 50, 100].map((size) => (
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
        onPageChange={onPageChange}
      />
    </div>
  );
}
