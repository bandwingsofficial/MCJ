"use client";

import { useState } from "react";
import { ChevronDown, Layers, Trash2 } from "lucide-react";

import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";
import { formatContentOrderNumber } from "@/src/shared/utils/content-order";

import { CourseModuleStatusBadge } from "@/src/features/course-modules/components";
import type { CourseModule } from "@/src/features/course-modules/types/course-module.types";

const MODULE_ACCENTS = [
  {
    card: "border-[#C7D9F5] bg-[#F8FBFF]",
    badge: "bg-[#2563EB] text-white",
    chip: "bg-blue-50 text-[#2563EB] ring-blue-100",
    icon: "text-[#2563EB]",
    body: "bg-[#EFF6FF] border-[#BFDBFE]",
  },
  {
    card: "border-violet-200 bg-violet-50/50",
    badge: "bg-violet-600 text-white",
    chip: "bg-violet-50 text-violet-700 ring-violet-100",
    icon: "text-violet-600",
    body: "bg-violet-50/80 border-violet-200",
  },
  {
    card: "border-teal-200 bg-teal-50/40",
    badge: "bg-teal-600 text-white",
    chip: "bg-teal-50 text-teal-700 ring-teal-100",
    icon: "text-teal-600",
    body: "bg-teal-50/70 border-teal-200",
  },
] as const;

interface ModuleCounts {
  lessons: number;
  resources: number;
  quizzes: number;
  assignments: number;
}

function formatModuleCountsSummary(counts: ModuleCounts): string {
  return [
    `${counts.lessons} lesson${counts.lessons === 1 ? "" : "s"}`,
    `${counts.resources} resource${counts.resources === 1 ? "" : "s"}`,
    `${counts.quizzes} quiz${counts.quizzes === 1 ? "" : "zes"}`,
    `${counts.assignments} assignment${counts.assignments === 1 ? "" : "s"}`,
  ].join(" · ");
}

interface ModuleAccordionItemProps {
  module: CourseModule;
  index: number;
  counts: ModuleCounts;
  actionsDisabled?: boolean;
  onDelete: (module: CourseModule) => void;
}

function ModuleAccordionItem({
  module,
  index,
  counts,
  actionsDisabled = false,
  onDelete,
}: ModuleAccordionItemProps) {
  const [open, setOpen] = useState(false);
  const accent = MODULE_ACCENTS[index % MODULE_ACCENTS.length];
  const orderLabel = formatContentOrderNumber(module.displayOrder ?? index + 1);

  return (
    <div
      className={`overflow-hidden rounded-xl border shadow-sm transition-shadow ${accent.card} ${
        open ? "ring-2 ring-[#DCE8F5]" : ""
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-start gap-3 p-4 text-left"
        aria-expanded={open}
      >
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${accent.badge}`}
        >
          {orderLabel}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
                Module {orderLabel}
              </p>
              <p className="mt-0.5 text-base font-semibold text-[#102A56]">
                {module.title}
              </p>
            </div>
            <CourseModuleStatusBadge module={module} />
          </div>

          <p className="mt-2 text-xs text-[#647A9B]">
            {formatModuleCountsSummary(counts)}
          </p>
        </div>

        <div
          className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#DCE8F5] bg-white ${accent.icon}`}
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {open ? (
        <div className="border-t border-white/70 px-4 pb-4 pt-1">
          <div className={`rounded-xl border px-3 py-3 ${accent.body}`}>
            {module.description?.trim() ? (
              <p className="text-sm leading-relaxed text-[#647A9B]">
                {module.description}
              </p>
            ) : (
              <p className="text-sm text-[#647A9B]">No description provided.</p>
            )}

            <p className="mt-3 text-xs text-[#647A9B]">
              {formatModuleCountsSummary(counts)}
            </p>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/70 pt-3">
              <CourseModuleStatusBadge module={module} />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={actionsDisabled}
                aria-label="Delete module"
                className="h-8 rounded-lg px-2.5 text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => onDelete(module)}
              >
                <Trash2 className="mr-1.5 h-4 w-4 shrink-0" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

interface Props {
  modules: CourseModule[];
  getModuleCounts: (module: CourseModule) => ModuleCounts;
  actionsDisabled?: boolean;
  onDelete: (module: CourseModule) => void;
}

export function CourseOverviewModulesAccordion({
  modules,
  getModuleCounts,
  actionsDisabled = false,
  onDelete,
}: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#E1EBF5] bg-white shadow-sm">
      <div className="border-b border-[#E1EBF5] bg-gradient-to-r from-[#F8FBFF] to-white px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2563EB] text-white shadow-sm">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#102A56]">
                Course Modules
              </h3>
              <p className="mt-0.5 text-sm text-[#647A9B]">
                Expand a module to view its details and content summary.
              </p>
            </div>
          </div>
          <Badge variant="info" className="px-3 py-1 text-xs">
            {modules.length} module{modules.length === 1 ? "" : "s"}
          </Badge>
        </div>
      </div>

      <div className="space-y-3 bg-[#FAFCFF] p-4">
        {modules.map((module, index) => (
          <ModuleAccordionItem
            key={module.id}
            module={module}
            index={index}
            counts={getModuleCounts(module)}
            actionsDisabled={actionsDisabled}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
