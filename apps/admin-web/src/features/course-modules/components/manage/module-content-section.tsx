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
    <Card className="overflow-hidden rounded-xl border-[#E1EBF5] p-0 shadow-sm">
      <div className="border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] px-4 py-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-base font-semibold text-[#102A56]">{title}</h2>

          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:w-auto lg:shrink-0">
            <div className="w-full sm:w-[240px]">
              <SearchInput
                value={search}
                onChange={onSearchChange}
                placeholder={searchPlaceholder}
                className="h-9 rounded-lg !py-1.5 pl-9 text-sm"
              />
            </div>

            {showStatusFilter && onStatusChange ? (
              <div className="w-full sm:w-[160px]">
                <AppSelect
                  value={status}
                  triggerClassName="h-9 rounded-lg px-2.5 text-sm"
                  onValueChange={onStatusChange}
                  options={statusOptions}
                />
              </div>
            ) : null}

            <Button
              type="button"
              size="sm"
              disabled={actionDisabled}
              className="h-9 shrink-0 border-0 bg-gradient-to-r from-[#0EA5E9] to-[#2563EB] px-4 text-sm font-semibold text-white shadow-[0_3px_10px_rgba(37,99,235,0.25)] hover:from-[#0284C7] hover:to-[#1D4ED8]"
              onClick={onAction}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              {actionLabel}
            </Button>
          </div>
        </div>
      </div>

      {children}
    </Card>
  );
}
