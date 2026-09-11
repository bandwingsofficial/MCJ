"use client";

import { CategoryPagination } from "@/src/features/categories/components/category-pagination";

import { BRANCH_PAGINATION_FOOTER_CLASS } from "./branch-manage-layout.constants";

interface Props {
  from: number;
  to: number;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  disabled?: boolean;
  showPageSizeSelector?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function BranchManagePaginationFooter({
  from,
  to,
  total,
  page,
  pageSize,
  totalPages,
  disabled = false,
  showPageSizeSelector = true,
  onPageChange,
  onPageSizeChange,
}: Props) {
  return (
    <div className={BRANCH_PAGINATION_FOOTER_CLASS}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#647A9B] sm:text-sm">
        <span>
          Showing {from}–{to} of {total}
        </span>

        {showPageSizeSelector ? (
          <label className="flex items-center gap-1.5">
            <span className="whitespace-nowrap">Rows per page</span>
            <select
              className="h-7 rounded-md border border-[#DCE8F5] bg-white px-1.5 text-xs text-[#102A56] sm:text-sm"
              value={pageSize}
              disabled={disabled}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
            >
              {[10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      <CategoryPagination
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}
