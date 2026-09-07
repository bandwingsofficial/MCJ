"use client";

import { useEffect, useRef } from "react";

import { Checkbox } from "@/src/shared/components/ui/checkbox";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { Button } from "@/src/shared/components/ui/button";

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
  onCreate: () => void;
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
  onCreate,
}: Props) {
  const selectAllRef = useRef<HTMLInputElement | null>(null);
  const selectionEnabled = Boolean(onSelectionChange);
  const visibleIds = templates.map((item) => item.id);
  const selectedVisibleCount = visibleIds.filter((id) =>
    selectedIds.includes(id),
  ).length;
  const allVisibleSelected =
    visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;
  const someVisibleSelected =
    selectedVisibleCount > 0 && !allVisibleSelected;
  const columnCount = selectionEnabled ? 8 : 7;

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
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-100">
        <thead className="bg-slate-50/80">
          <tr>
            {selectionEnabled ? (
              <th className="w-11 px-3 py-3 text-left">
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300"
                  checked={allVisibleSelected}
                  disabled={selectionDisabled || visibleIds.length === 0}
                  onChange={(event) => toggleAllVisible(event.target.checked)}
                  aria-label="Select all batch timings on this page"
                />
              </th>
            ) : null}
            <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Batch Name
            </th>
            <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Mode
            </th>
            <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Days
            </th>
            <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Time
            </th>
            <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Capacity
            </th>
            <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Status
            </th>
            <th className="px-2 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {templates.length === 0 ? (
            <tr>
              <td colSpan={columnCount} className="px-3 py-12">
                <EmptyState
                  title="No batch timings found"
                  description="Create a batch timing to use it across courses."
                  action={
                    <Button type="button" onClick={onCreate}>
                      + Add Batch Timing
                    </Button>
                  }
                />
              </td>
            </tr>
          ) : (
            templates.map((template) => (
              <tr
                key={template.id}
                className="bg-white transition-colors hover:bg-slate-50"
              >
                {selectionEnabled ? (
                  <td className="w-11 px-3 py-3 align-middle">
                    <Checkbox
                      checked={selectedIds.includes(template.id)}
                      disabled={selectionDisabled}
                      onCheckedChange={(checked) =>
                        toggleRow(template.id, Boolean(checked))
                      }
                    />
                  </td>
                ) : null}
                <td className="truncate px-3 py-3 align-middle text-sm font-medium text-[#102A56]">
                  {template.name}
                </td>
                <td className="px-3 py-3 align-middle">
                  <BatchTemplateModeBadge mode={template.mode} />
                </td>
                <td className="truncate px-3 py-3 align-middle text-sm text-slate-700">
                  {template.hasFixedTime
                    ? formatTemplateDays(template.daysOfWeek)
                    : "Anytime"}
                </td>
                <td className="truncate px-3 py-3 align-middle text-sm text-slate-700">
                  {formatTemplateTime(template)}
                </td>
                <td className="px-3 py-3 align-middle text-sm text-slate-700">
                  {template.capacity}
                </td>
                <td className="px-3 py-3 align-middle">
                  <BatchTemplateStatusBadge
                    isActive={template.isActive}
                    isDeleted={template.isDeleted}
                  />
                </td>
                <td className="w-[9rem] px-2 py-3 align-middle">
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
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
