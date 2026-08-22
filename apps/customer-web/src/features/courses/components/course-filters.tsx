"use client";

import type { Category } from "@/src/features/categories/types/category.types";
import type { PublicBranch } from "@/src/features/branches/types/branch.types";

interface Props {
  categories: Category[];
  branches: PublicBranch[];
  selectedCategoryId?: string;
  selectedBranchId?: string;
  onCategoryChange: (categoryId?: string) => void;
  onBranchChange: (branchId?: string) => void;
}

export function CourseFilters({
  categories,
  branches,
  selectedCategoryId,
  selectedBranchId,
  onCategoryChange,
  onBranchChange,
}: Props) {
  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Categories</p>
        <div className="flex flex-wrap gap-2">
          <FilterChip
            label="All"
            active={!selectedCategoryId}
            onClick={() => onCategoryChange(undefined)}
          />
          {categories.map((category) => (
            <FilterChip
              key={category.id}
              label={category.name}
              active={selectedCategoryId === category.id}
              onClick={() => onCategoryChange(category.id)}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Branches</p>
        <div className="flex flex-wrap gap-2">
          <FilterChip
            label="All"
            active={!selectedBranchId}
            onClick={() => onBranchChange(undefined)}
          />
          {branches.map((branch) => (
            <FilterChip
              key={branch.id}
              label={branch.branchName}
              active={selectedBranchId === branch.id}
              onClick={() => onBranchChange(branch.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "border-indigo-600 bg-indigo-600 text-white"
          : "border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:text-indigo-700"
      }`}
    >
      {label}
    </button>
  );
}
