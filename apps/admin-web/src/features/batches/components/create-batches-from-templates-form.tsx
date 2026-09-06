"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";
import { AppSelect } from "@/src/shared/components/ui/select";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { batchService } from "@/src/features/batches/services/batch.service";
import { uniqueSelectOptions } from "@/src/features/batches/utils/batch-select.utils";
import type { CourseOption } from "@/src/features/batches/types/batch.types";
import { batchTemplateService } from "@/src/features/batch-templates/services/batch-template.service";
import { formatTemplateScheduleSummary } from "@/src/features/batch-templates/utils/batch-template-display.utils";
import type { BatchTemplate } from "@/src/features/batch-templates/types/batch-template.types";

type Props = {
  onSuccess: () => void | Promise<void>;
  onCancel: () => void;
};

export function CreateBatchesFromTemplatesForm({
  onSuccess,
  onCancel,
}: Props) {
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [templates, setTemplates] = useState<BatchTemplate[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [courseId, setCourseId] = useState("");
  const [startDate, setStartDate] = useState(
    () => new Date().toISOString().split("T")[0]!,
  );
  const [endDate, setEndDate] = useState(
    () => new Date().toISOString().split("T")[0]!,
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setCoursesLoading(true);
      setTemplatesLoading(true);
      try {
        const [courseItems, templateItems] = await Promise.all([
          batchService.getCourses(),
          batchTemplateService.listTemplates({ isActive: true }),
        ]);
        if (!cancelled) {
          setCourses(courseItems);
          setTemplates(templateItems);
        }
      } catch (error) {
        if (!cancelled) {
          appToast.error(getErrorMessage(error));
        }
      } finally {
        if (!cancelled) {
          setCoursesLoading(false);
          setTemplatesLoading(false);
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const courseOptions = useMemo(
    () =>
      uniqueSelectOptions(
        courses.map((course) => ({
          label: course.title,
          value: course.id,
        })),
      ),
    [courses],
  );

  const toggleTemplate = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSubmit = async () => {
    if (!courseId) {
      appToast.error("Select a course");
      return;
    }
    if (!startDate || !endDate) {
      appToast.error("Start date and end date are required");
      return;
    }
    if (endDate < startDate) {
      appToast.error("End date cannot be earlier than start date");
      return;
    }
    if (!selectedIds.length) {
      appToast.error("Select at least one schedule template");
      return;
    }

    setIsSubmitting(true);
    try {
      const response =
        await batchTemplateService.createBatchesFromTemplates({
          courseId,
          startDate,
          endDate,
          templateIds: selectedIds,
        });

      const { createdCount, failedCount, results } = response.data;

      if (failedCount === 0) {
        appToast.success(
          response.message ||
            `${createdCount} batch(es) created successfully`,
        );
        await onSuccess();
        return;
      }

      const failedNames = results
        .filter((item) => !item.success)
        .map((item) => `${item.templateName}: ${item.error ?? "failed"}`)
        .join("; ");

      if (createdCount > 0) {
        appToast.warning(
          `${createdCount} created, ${failedCount} failed. ${failedNames}`,
        );
        await onSuccess();
      } else {
        appToast.error(failedNames || response.message);
      }
    } catch (error) {
      appToast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label>Course</Label>
        <AppSelect
          value={courseId}
          onValueChange={setCourseId}
          options={courseOptions}
          placeholder={
            coursesLoading ? "Loading courses..." : "Select a course"
          }
          disabled={coursesLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="from-template-start">Start Date</Label>
          <Input
            id="from-template-start"
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="from-template-end">End Date</Label>
          <Input
            id="from-template-end"
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label>Select Batch Schedules</Label>
        {templatesLoading ? (
          <p className="text-sm text-slate-500">Loading templates...</p>
        ) : templates.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
            No active schedule templates. Create and enable templates in Batch
            Templates first.
          </p>
        ) : (
          <div className="space-y-2">
            {templates.map((template) => {
              const checked = selectedIds.includes(template.id);
              return (
                <label
                  key={template.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-colors ${
                    checked
                      ? "border-[#2563EB] bg-[#F4F9FF]"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-slate-300"
                    checked={checked}
                    onChange={() => toggleTemplate(template.id)}
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-[#102A56]">
                      {template.name}
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      {formatTemplateScheduleSummary(template)}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="button"
          loading={isSubmitting}
          disabled={isSubmitting || templates.length === 0}
          onClick={() => {
            void handleSubmit();
          }}
        >
          Create Selected Batches
        </Button>
      </div>
    </div>
  );
}
