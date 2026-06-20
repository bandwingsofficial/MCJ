"use client";

import {
  Search,
} from "lucide-react";

import { Input } from "@/src/shared/components/ui/input";

import {
  AppSelect,
  SelectOption,
} from "@/src/shared/components/ui/select";

import {
  EnrollmentFilters as Filters,
  EnrollmentStatus,
  PaymentStatus,
  SortOrder,
} from "../../types";

interface EnrollmentFiltersProps {
  filters: Filters;

  onChange: (
    filters: Filters,
  ) => void;
}

const statusOptions: SelectOption[] = [
  {
    label: "All Status",
    value: "ALL",
  },
  ...Object.values(
    EnrollmentStatus,
  ).map((status) => ({
    label: status,
    value: status,
  })),
];

const paymentOptions: SelectOption[] =
  [
    {
      label: "All Payments",
      value: "ALL",
    },
    ...Object.values(
      PaymentStatus,
    ).map((status) => ({
      label: status,
      value: status,
    })),
  ];

const activeOptions: SelectOption[] =
  [
    {
      label: "All",
      value: "ALL",
    },
    {
      label: "Active",
      value: "true",
    },
    {
      label: "Inactive",
      value: "false",
    },
  ];

const sortOptions: SelectOption[] = [
  {
    label: "Newest",
    value: SortOrder.DESC,
  },
  {
    label: "Oldest",
    value: SortOrder.ASC,
  },
];

export function EnrollmentFilters({
  filters,
  onChange,
}: EnrollmentFiltersProps) {
  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-5">

      <div className="relative">

        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

        <Input
          placeholder="Search..."
          className="pl-9"
          value={
            filters.search ?? ""
          }
          onChange={(e) =>
            onChange({
              ...filters,
              search:
                e.target.value,
              skip: 0,
            })
          }
        />

      </div>

      <AppSelect
        placeholder="Status"
        value={
          filters.status ??
          "ALL"
        }
        options={
          statusOptions
        }
        onValueChange={(
          value: string,
        ) =>
          onChange({
            ...filters,
            status:
              value === "ALL"
                ? undefined
                : value as EnrollmentStatus,
            skip: 0,
          })
        }
      />

      <AppSelect
        placeholder="Payment"
        value={
          filters.paymentStatus ??
          "ALL"
        }
        options={
          paymentOptions
        }
        onValueChange={(
          value: string,
        ) =>
          onChange({
            ...filters,
            paymentStatus:
              value === "ALL"
                ? undefined
                : value as PaymentStatus,
            skip: 0,
          })
        }
      />

      <AppSelect
        placeholder="Active"
        value={
          filters.isActive ===
          undefined
            ? "ALL"
            : String(
                filters.isActive,
              )
        }
        options={
          activeOptions
        }
        onValueChange={(
          value: string,
        ) =>
          onChange({
            ...filters,
            isActive:
              value === "ALL"
                ? undefined
                : value ===
                  "true",
            skip: 0,
          })
        }
      />

      <AppSelect
        placeholder="Sort"
        value={
          filters.sortOrder ??
          SortOrder.DESC
        }
        options={
          sortOptions
        }
        onValueChange={(
          value: string,
        ) =>
          onChange({
            ...filters,
            sortOrder:
              value as SortOrder,
          })
        }
      />

    </div>
  );
}