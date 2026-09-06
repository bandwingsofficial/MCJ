"use client";

import { Button } from "@/src/shared/components/ui/button";

import {
  formatTemplateDays,
  formatTemplateMode,
  formatTemplateTime,
} from "@/src/features/batch-templates/utils/batch-template-display.utils";
import type { BatchTemplate } from "@/src/features/batch-templates/types/batch-template.types";

type Props = {
  templates: BatchTemplate[];
  onEdit: (template: BatchTemplate) => void;
  onToggleActive: (template: BatchTemplate) => void;
  togglingId?: string | null;
};

export function BatchTemplateTable({
  templates,
  onEdit,
  onToggleActive,
  togglingId,
}: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-100">
        <thead className="bg-slate-50/80">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Batch Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Mode
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Days
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Time
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Status
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {templates.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="px-4 py-12 text-center text-sm text-slate-500"
              >
                No batch timings yet. Add standard schedules once, then use
                them when assigning batches.
              </td>
            </tr>
          ) : (
            templates.map((template) => (
              <tr key={template.id} className="hover:bg-slate-50/60">
                <td className="px-4 py-3 text-sm font-medium text-[#102A56]">
                  {template.name}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  {formatTemplateMode(template.mode)}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  {template.hasFixedTime
                    ? formatTemplateDays(template.daysOfWeek)
                    : "Anytime"}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  {formatTemplateTime(template)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      template.isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {template.isActive ? "Active" : "Disabled"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(template)}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={togglingId === template.id}
                      onClick={() => onToggleActive(template)}
                    >
                      {template.isActive ? "Disable" : "Enable"}
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
