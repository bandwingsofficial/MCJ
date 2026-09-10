"use client";

import { useEffect, useRef } from "react";

import { Checkbox } from "@/src/shared/components/ui/checkbox";

import { BatchTemplateActions } from "@/src/features/batch-templates/components/batch-template-actions";
import { BatchTemplateModeBadge } from "@/src/features/batch-templates/components/batch-template-mode-badge";
import { BatchTemplateStatusBadge } from "@/src/features/batch-templates/components/batch-template-status-badge";
import {
  formatTemplateDays,
  formatTemplateTime,
} from "@/src/features/batch-templates/utils/batch-template-display.utils";
import type { BatchTemplate } from "@/src/features/batch-templates/types/batch-template.types";

interface Props {
  templates: BatchTemplate[];
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  actionsDisabled?: boolean;
  selectionDisabled?: boolean;
  onEdit: (template: BatchTemplate) => void;
  onActivate: (template: BatchTemplate) => void;
  onDeactivate: (template: BatchTemplate) => void;
  onArchive: (template: BatchTemplate) => void;
  onRestore: (template: BatchTemplate) => void;
  onPermanentDelete: (template: BatchTemplate) => void;
}

export function BatchTemplateTable({
  templates,
  selectedIds = [],
  onSelectionChange,
  actionsDisabled = false,
  selectionDisabled = false,
  onEdit,
  onActivate,
  onDeactivate,
  onArchive,
  onRestore,
  onPermanentDelete,
}: Props) {
  const selectAllRef = useRef<HTMLInputElement | null>(null);
  const selectionEnabled = Boolean(onSelectionChange);
  const visibleIds = templates.map((item) => item.id);
  const columnCount = selectionEnabled ? 8 : 7;
  const selectedVisibleCount = visibleIds.filter((id) =>
    selectedIds.includes(id),
  ).length;
  const allVisibleSelected =
    visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;
  const someVisibleSelected =
    selectedVisibleCount > 0 && !allVisibleSelected;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someVisibleSelected;
    }
  }, [someVisibleSelected, allVisibleSelected]);

  const toggleRow = (id: string, checked: boolean) => {
    if (!onSelectionChange || selectionDisabled) return;
    onSelectionChange(
      checked
        ? Array.from(new Set([...selectedIds, id]))
        : selectedIds.filter((item) => item !== id),
    );
  };

  const toggleAllVisible = (checked: boolean) => {
    if (!onSelectionChange || selectionDisabled) return;
    if (!checked) {
      onSelectionChange(selectedIds.filter((id) => !visibleIds.includes(id)));
      return;
    }
    onSelectionChange(Array.from(new Set([...selectedIds, ...visibleIds])));
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-full border-collapse text-sm">
        <thead className="sticky top-0 z-10 border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] text-[#526581]">
          <tr>
            {selectionEnabled ? (
              <th className="w-9 !px-6 !py-4 text-left">
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded border-slate-300"
                  checked={allVisibleSelected}
                  disabled={selectionDisabled || visibleIds.length === 0}
                  onChange={(event) => toggleAllVisible(event.target.checked)}
                  aria-label="Select all batch timings on this page"
                />
              </th>
            ) : null}
            <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Batch Name
            </th>
            <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Mode
            </th>
            <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Days
            </th>
            <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Time
            </th>
            <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Capacity
            </th>
            <th className="w-24 !px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Status
            </th>
            <th className="w-[6.75rem] !px-8 !py-4 text-right text-[11px] font-semibold tracking-wide text-slate-500">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {templates.length === 0 ? (
            <tr>
              <td
                colSpan={columnCount}
                className="!px-4 !py-4 align-middle"
              >
                <div className="flex min-h-[120px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 px-4 py-4 text-center">
                  <h3 className="text-base font-semibold">
                    No Batch Timings Found
                  </h3>
                  <p className="mt-1 max-w-md text-sm text-[#647A9B]">
                    Create your first batch timing or adjust your filters.
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            templates.map((template) => {
              const isArchived = Boolean(template.isDeleted);

              return (
                <tr
                  key={template.id}
                  className={`border-b border-slate-100 transition-colors hover:bg-slate-50 ${
                    isArchived ? "bg-slate-50/40" : "bg-white"
                  }`}
                >
                  {selectionEnabled ? (
                    <td className="w-9 !px-6 !py-4 align-middle">
                      <Checkbox
                        checked={selectedIds.includes(template.id)}
                        disabled={selectionDisabled}
                        onCheckedChange={(checked) =>
                          toggleRow(template.id, Boolean(checked))
                        }
                      />
                    </td>
                  ) : null}
                  <td className="!px-4 !py-4 align-middle">
                    <p className="text-sm font-medium leading-snug text-[#102A56]">
                      {template.name}
                    </p>
                  </td>
                  <td className="!px-4 !py-4 align-middle">
                    <BatchTemplateModeBadge mode={template.mode} />
                  </td>
                  <td className="!px-4 !py-4 align-middle text-sm text-slate-700">
                    {template.hasFixedTime
                      ? formatTemplateDays(template.daysOfWeek)
                      : "Anytime"}
                  </td>
                  <td className="!px-4 !py-4 align-middle text-sm text-slate-700">
                    {formatTemplateTime(template)}
                  </td>
                  <td className="!px-4 !py-4 align-middle text-sm tabular-nums text-slate-700">
                    {template.capacity}
                  </td>
                  <td className="!px-4 !py-4 align-middle">
                    <BatchTemplateStatusBadge
                      isActive={template.isActive}
                      isDeleted={template.isDeleted}
                    />
                  </td>
                  <td className="!px-8 !py-4 align-middle">
                    <BatchTemplateActions
                      template={template}
                      disabled={actionsDisabled}
                      onEdit={onEdit}
                      onActivate={onActivate}
                      onDeactivate={onDeactivate}
                      onArchive={onArchive}
                      onRestore={onRestore}
                      onPermanentDelete={onPermanentDelete}
                    />
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
