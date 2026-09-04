"use client";

import { useLayoutEffect, useMemo, useState, type RefObject } from "react";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, ChevronDown, Search, UserRound, X } from "lucide-react";

import { Checkbox } from "@/src/shared/components/ui/checkbox";
import { cn } from "@/src/shared/lib/cn";

export interface CourseTrainerOption {
  id: string;
  label: string;
  /** When true, still shown if selected but hidden from new-pick list unless selected. */
  inactive?: boolean;
}

interface Props {
  value: string[];
  options: CourseTrainerOption[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  loading?: boolean;
  triggerClassName?: string;
  state?: "neutral" | "valid" | "invalid";
  collisionBoundary?: HTMLElement | null;
  collisionBoundaryRef?: RefObject<HTMLElement | null>;
}

export function TrainerMultiSelect({
  value,
  options,
  onChange,
  disabled = false,
  loading = false,
  triggerClassName,
  state = "neutral",
  collisionBoundary,
  collisionBoundaryRef,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [resolvedBoundary, setResolvedBoundary] = useState<HTMLElement | null>(
    collisionBoundary ?? null,
  );
  const selected = value ?? [];

  useLayoutEffect(() => {
    if (collisionBoundaryRef?.current) {
      setResolvedBoundary(collisionBoundaryRef.current);
      return;
    }

    setResolvedBoundary(collisionBoundary ?? null);
  }, [collisionBoundary, collisionBoundaryRef, open]);

  const optionById = useMemo(() => {
    const map = new Map<string, CourseTrainerOption>();
    for (const option of options) {
      map.set(option.id, option);
    }
    return map;
  }, [options]);

  const selectableOptions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return options.filter((option) => {
      if (option.inactive && !selected.includes(option.id)) {
        return false;
      }

      if (!query) {
        return true;
      }

      return option.label.toLowerCase().includes(query);
    });
  }, [options, search, selected]);

  const toggle = (trainerId: string) => {
    if (selected.includes(trainerId)) {
      onChange(selected.filter((id) => id !== trainerId));
      return;
    }

    onChange([...selected, trainerId]);
  };

  const remove = (trainerId: string) => {
    onChange(selected.filter((id) => id !== trainerId));
  };

  const borderClass =
    state === "invalid"
      ? "border-red-400 focus:ring-red-200"
      : state === "valid"
        ? "border-emerald-400 focus:ring-emerald-200"
        : "border-slate-300 focus:ring-[#2563EB]";

  return (
    <div className="space-y-2">
      <DropdownMenu.Root
        open={open}
        modal={false}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            setSearch("");
          }
        }}
      >
        <DropdownMenu.Trigger
          type="button"
          disabled={disabled || loading}
          className={cn(
            "relative flex h-11 w-full min-w-0 max-w-full items-center justify-between gap-2 rounded-xl border bg-white px-4 py-2 text-left text-sm focus:outline-none focus:ring-2",
            borderClass,
            disabled && "cursor-not-allowed opacity-60",
            triggerClassName,
          )}
        >
          <span className="flex min-w-0 items-center gap-2 truncate text-slate-700">
            <UserRound className="h-4 w-4 shrink-0 text-slate-400" />
            <span className="truncate">
              {loading
                ? "Loading trainers..."
                : selected.length > 0
                  ? `${selected.length} trainer${selected.length === 1 ? "" : "s"} selected`
                  : "Select trainers"}
            </span>
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            side="bottom"
            align="start"
            sideOffset={4}
            collisionPadding={12}
            avoidCollisions
            sticky="partial"
            collisionBoundary={resolvedBoundary ?? undefined}
            className="z-[100] max-h-72 w-[var(--radix-dropdown-menu-trigger-width)] max-w-[min(var(--radix-dropdown-menu-trigger-width),calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
            onCloseAutoFocus={(event) => event.preventDefault()}
          >
            <div className="border-b border-slate-100 p-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search trainers..."
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-sm text-[#102A56] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                  onKeyDown={(event) => event.stopPropagation()}
                />
              </div>
            </div>

            <div className="max-h-52 overflow-y-auto p-1">
              {loading ? (
                <p className="px-3 py-6 text-center text-sm text-slate-500">
                  Loading trainers...
                </p>
              ) : selectableOptions.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-slate-500">
                  No active trainers found
                </p>
              ) : (
                selectableOptions.map((option) => {
                  const checked = selected.includes(option.id);

                  return (
                    <DropdownMenu.Item
                      key={option.id}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-slate-700 outline-none hover:bg-slate-50 focus:bg-slate-50"
                      onSelect={(event) => {
                        event.preventDefault();
                        toggle(option.id);
                      }}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => undefined}
                      />
                      <span className="min-w-0 flex-1 truncate">
                        {option.label}
                      </span>
                      {checked ? (
                        <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                      ) : null}
                    </DropdownMenu.Item>
                  );
                })
              )}
            </div>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      {selected.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selected.map((id) => {
            const option = optionById.get(id);
            const label = option?.label ?? id;

            return (
              <span
                key={id}
                className="inline-flex max-w-full items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-[#102A56]"
              >
                <span className="truncate">{label}</span>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => remove(id)}
                  className="rounded-full p-0.5 text-slate-500 hover:bg-slate-200 hover:text-slate-700 disabled:opacity-50"
                  aria-label={`Remove ${label}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
