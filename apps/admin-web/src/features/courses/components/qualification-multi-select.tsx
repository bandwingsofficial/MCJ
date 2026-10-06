"use client";

import {
  useLayoutEffect,
  useMemo,
  useState,
  type RefObject,
} from "react";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, ChevronDown, Search } from "lucide-react";

import { Checkbox } from "@/src/shared/components/ui/checkbox";
import { Input } from "@/src/shared/components/ui/input";
import { cn } from "@/src/shared/lib/cn";

import {
  buildLegacyCourseMinimumQualificationGroup,
  filterCourseMinimumQualificationGroups,
  getCourseMinimumQualificationLabel,
  isCourseMinimumQualification,
} from "@mcj/shared-constants";

import type { CourseQualification } from "@/src/features/courses/types/course.types";
import { formatCourseQualifications } from "@/src/features/courses/utils/course-display.utils";

interface Props {
  value: CourseQualification[];
  onChange: (value: CourseQualification[]) => void;
  disabled?: boolean;
  triggerClassName?: string;
  /** When true, reserve left padding for a parent field icon (IconValidatedField). */
  insetForLeftFieldIcon?: boolean;
  state?: "neutral" | "valid" | "invalid";
  collisionBoundary?: HTMLElement | null;
  collisionBoundaryRef?: RefObject<HTMLElement | null>;
}

export function QualificationMultiSelect({
  value,
  onChange,
  disabled = false,
  triggerClassName,
  insetForLeftFieldIcon = false,
  state = "neutral",
  collisionBoundary,
  collisionBoundaryRef,
}: Props) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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

  useLayoutEffect(() => {
    if (!open) {
      setSearchQuery("");
    }
  }, [open]);

  const toggle = (qualification: CourseQualification) => {
    if (selected.includes(qualification)) {
      onChange(selected.filter((item) => item !== qualification));
      return;
    }

    onChange([...selected, qualification]);
  };

  const filteredGroups = useMemo(() => {
    const legacyGroup = buildLegacyCourseMinimumQualificationGroup(selected);
    const groups = filterCourseMinimumQualificationGroups(searchQuery);

    if (legacyGroup && !searchQuery.trim()) {
      return [legacyGroup, ...groups];
    }

    if (legacyGroup && searchQuery.trim()) {
      const legacyFiltered = {
        ...legacyGroup,
        values: legacyGroup.values.filter((item) =>
          getCourseMinimumQualificationLabel(item)
            .toLowerCase()
            .includes(searchQuery.trim().toLowerCase()),
        ),
      };

      if (legacyFiltered.values.length > 0) {
        return [legacyFiltered, ...groups];
      }
    }

    return groups;
  }, [searchQuery, selected]);

  const borderClass =
    state === "invalid"
      ? "border-red-400 focus:ring-red-200"
      : state === "valid"
        ? "border-emerald-400 focus:ring-emerald-200"
        : "border-slate-300 focus:ring-[#2563EB]";

  return (
    <DropdownMenu.Root
      open={open}
      modal={false}
      onOpenChange={setOpen}
    >
      <DropdownMenu.Trigger
        type="button"
        disabled={disabled}
        className={cn(
          "relative flex h-11 w-full min-w-0 max-w-full items-center justify-between gap-2 rounded-xl border bg-white py-2 pr-10 text-left text-sm focus:outline-none focus:ring-2",
          insetForLeftFieldIcon ? "pl-10" : "pl-4",
          borderClass,
          triggerClassName,
        )}
      >
        <span
          className={cn(
            "min-w-0 flex-1 truncate",
            selected.length === 0 ? "text-slate-400" : "text-[#102A56]",
          )}
        >
          {selected.length === 0
            ? "Select qualifications"
            : formatCourseQualifications(selected)}
        </span>

        <ChevronDown
          className="h-4 w-4 shrink-0 text-slate-500"
          aria-hidden="true"
        />
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
          className="z-[100] flex max-h-72 w-[var(--radix-dropdown-menu-trigger-width)] max-w-[min(var(--radix-dropdown-menu-trigger-width),calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
          onCloseAutoFocus={(event) => event.preventDefault()}
        >
          <div
            className="sticky top-0 z-10 border-b border-slate-100 bg-white p-2"
            onKeyDown={(event) => event.stopPropagation()}
          >
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchQuery}
                placeholder="Search qualifications…"
                className="h-9 pl-8 text-sm"
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={(event) => event.stopPropagation()}
              />
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto p-1">
            {filteredGroups.length === 0 ? (
              <p className="px-2 py-3 text-center text-sm text-slate-500">
                No qualifications match your search.
              </p>
            ) : (
              filteredGroups.map((group) => (
                <div key={group.id} className="py-1">
                  <DropdownMenu.Label className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {group.label}
                  </DropdownMenu.Label>

                  {group.values.map((qualification) => {
                    const optionValue = qualification as CourseQualification;
                    const checked = selected.includes(optionValue);
                    const label = isCourseMinimumQualification(qualification)
                      ? getCourseMinimumQualificationLabel(qualification)
                      : qualification;

                    return (
                      <DropdownMenu.Item
                        key={`${group.id}-${qualification}`}
                        className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-slate-700 outline-none hover:bg-slate-50 focus:bg-slate-50"
                        onSelect={(event) => {
                          event.preventDefault();
                          if (isCourseMinimumQualification(qualification)) {
                            toggle(qualification);
                          }
                        }}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => undefined}
                        />
                        <span className="min-w-0 flex-1 truncate">{label}</span>
                        {checked ? (
                          <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                        ) : null}
                      </DropdownMenu.Item>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
