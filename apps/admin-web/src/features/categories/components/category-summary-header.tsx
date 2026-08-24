"use client";

import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Skeleton } from "@/src/shared/components/ui/skeleton";

interface CategorySummaryHeaderProps {
  total: number;
  isLoading?: boolean;
  onCreate: () => void;
  createDisabled?: boolean;
}

export function CategorySummaryHeader({
  total,
  isLoading = false,
  onCreate,
  createDisabled = false,
}: CategorySummaryHeaderProps) {
  return (
    <header className="space-y-5">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-sm"
      >
        <Link
          href="/dashboard"
          className="text-slate-500 transition-colors hover:text-blue-600"
        >
          Home
        </Link>

        <ChevronRight
          className="h-4 w-4 text-slate-400"
          aria-hidden="true"
        />

        <span
          aria-current="page"
          className="font-medium text-slate-900"
        >
          Categories
        </span>
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-52 rounded-md" />
              <Skeleton className="mt-2 h-4 w-80 rounded" />
            </>
          ) : (
            <>
              {/* Title + Total */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Categories
                </h1>

                <span className="text-sm text-slate-500">
                  Total Categories:
                  <span className="ml-1 font-semibold tabular-nums text-slate-900">
                    {total}
                  </span>
                </span>
              </div>

              {/* Description */}
              <p className="mt-1.5 text-sm leading-6 text-slate-500">
                Organize and manage your learning content with structured
                course categories.
              </p>
            </>
          )}
        </div>

        {/* Create Category */}
        {isLoading ? (
          <Skeleton className="h-10 w-40 rounded-lg" />
        ) : (
          <Button
            type="button"
            onClick={onCreate}
            disabled={createDisabled}
            className="h-10 shrink-0 rounded-lg bg-blue-600 px-4 font-semibold shadow-sm transition-all hover:bg-blue-700 hover:shadow-md"
            aria-label="Create a new category"
          >
            <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Create Category
          </Button>
        )}
      </div>

      {/* Divider */}
      <div className="border-b border-slate-200" />
    </header>
  );
}