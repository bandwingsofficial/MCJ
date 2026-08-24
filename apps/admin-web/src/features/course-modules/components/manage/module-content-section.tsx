"use client";

import type { ReactNode } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { SearchInput } from "@/src/shared/components/ui/search-input";
import { AppSelect } from "@/src/shared/components/ui/select";

const DEFAULT_STATUS_OPTIONS = [
  { label: "All Status", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
];

interface Props {
  title: string;
  search: string;
  searchPlaceholder: string;
  onSearchChange: (value: string) => void;
  status?: string;
  onStatusChange?: (value: string) => void;
  showStatusFilter?: boolean;
  statusOptions?: { label: string; value: string }[];
  actionLabel: string;
  onAction: () => void;
  actionDisabled?: boolean;
  children: ReactNode;
}

export function ModuleContentSection({
  title,
  search,
  searchPlaceholder,
  onSearchChange,
  status = "ALL",
  onStatusChange,
  showStatusFilter = true,
  statusOptions = DEFAULT_STATUS_OPTIONS,
  actionLabel,
  onAction,
  actionDisabled = false,
  children,
}: Props) {
  return (
    <Card className="overflow-hidden border-slate-200 bg-white p-0 shadow-sm">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">{title}</h2>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
            <SearchInput
              value={search}
              onChange={onSearchChange}
              placeholder={searchPlaceholder}
              className="!h-10 max-w-xl rounded-lg !py-2 pl-9 text-[15px]"
            />
            {showStatusFilter && onStatusChange ? (
              <div className="w-full sm:w-48">
                <AppSelect
                  value={status}
                  onValueChange={onStatusChange}
                  options={statusOptions}
                />
              </div>
            ) : null}
          </div>

          <Button
            type="button"
            size="sm"
            disabled={actionDisabled}
            className="h-10 shrink-0 self-start lg:self-auto"
            onClick={onAction}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            {actionLabel}
          </Button>
        </div>
      </div>

      {children}
    </Card>
  );
}
