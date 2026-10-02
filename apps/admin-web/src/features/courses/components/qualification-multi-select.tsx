"use client";

import { useLayoutEffect, useState, type RefObject } from "react";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, ChevronDown } from "lucide-react";

import { Checkbox } from "@/src/shared/components/ui/checkbox";
import { cn } from "@/src/shared/lib/cn";

import {
  COURSE_QUALIFICATIONS,
  COURSE_QUALIFICATION_LABELS,
} from "@/src/features/courses/constants/course.constants";

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

  const toggle = (qualification: CourseQualification) => {
    if (selected.includes(qualification)) {
      onChange(selected.filter((item) => item !== qualification));
      return;
    }

    onChange([...selected, qualification]);
  };

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
          className="z-[100] max-h-60 w-[var(--radix-dropdown-menu-trigger-width)] max-w-[min(var(--radix-dropdown-menu-trigger-width),calc(100vw-2rem))] overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-lg"
          onCloseAutoFocus={(event) => event.preventDefault()}
        >
          {COURSE_QUALIFICATIONS.map((qualification) => {
            const checked = selected.includes(qualification);

            return (
              <DropdownMenu.Item
                key={qualification}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-slate-700 outline-none hover:bg-slate-50 focus:bg-slate-50"
                onSelect={(event) => {
                  event.preventDefault();
                  toggle(qualification);
                }}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => undefined}
                />
                <span className="min-w-0 flex-1 truncate">
                  {COURSE_QUALIFICATION_LABELS[qualification]}
                </span>
                {checked ? (
                  <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                ) : null}
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
