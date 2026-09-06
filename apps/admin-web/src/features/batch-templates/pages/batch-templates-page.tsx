"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { BatchTemplateFormModal } from "@/src/features/batch-templates/components/batch-template-form-modal";
import { BatchTemplateTable } from "@/src/features/batch-templates/components/batch-template-table";
import { batchTemplateService } from "@/src/features/batch-templates/services/batch-template.service";
import type { BatchTemplate } from "@/src/features/batch-templates/types/batch-template.types";

export function BatchTemplatesPage() {
  const [templates, setTemplates] = useState<BatchTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<BatchTemplate | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadTemplates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await batchTemplateService.listTemplates();
      setTemplates(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTemplates();
  }, [loadTemplates]);

  const handleToggleActive = async (template: BatchTemplate) => {
    setTogglingId(template.id);
    try {
      if (template.isActive) {
        await batchTemplateService.disableTemplate(template.id);
        appToast.success("Batch timing disabled");
      } else {
        await batchTemplateService.enableTemplate(template.id);
        appToast.success("Batch timing enabled");
      }
      await loadTemplates();
    } catch (err) {
      appToast.error(getErrorMessage(err));
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[#102A56]">
            Batch Timings
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage standard class schedules used across all courses.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => {
            setEditing(null);
            setIsFormOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Batch Timing
        </Button>
      </div>

      <Card className="border-slate-200 p-0 shadow-none">
        {isLoading ? (
          <div className="p-4">
            <SkeletonTable rows={6} />
          </div>
        ) : error ? (
          <div className="p-6">
            <ErrorState
              description={error}
              onRetry={() => void loadTemplates()}
            />
          </div>
        ) : (
          <BatchTemplateTable
            templates={templates}
            togglingId={togglingId}
            onEdit={(template) => {
              setEditing(template);
              setIsFormOpen(true);
            }}
            onToggleActive={(template) => {
              void handleToggleActive(template);
            }}
          />
        )}
      </Card>

      <BatchTemplateFormModal
        open={isFormOpen}
        template={editing}
        onClose={() => {
          setIsFormOpen(false);
          setEditing(null);
        }}
        onSuccess={() => {
          void loadTemplates();
        }}
      />
    </div>
  );
}
