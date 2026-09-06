"use client";

import { useEffect, useMemo, useState } from "react";

import { Modal } from "@/src/shared/components/ui/model";
import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";
import { AppSelect } from "@/src/shared/components/ui/select";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { FILTER_BATCH_MODES } from "@/src/features/batches/constants/batch.constants";
import { batchService } from "@/src/features/batches/services/batch.service";
import { uniqueSelectOptions } from "@/src/features/batches/utils/batch-select.utils";
import type {
  BatchMode,
  CourseOption,
} from "@/src/features/batches/types/batch.types";
import { batchTemplateService } from "@/src/features/batch-templates/services/batch-template.service";
import {
  formatTemplateDays,
  formatTemplateMode,
  formatTemplateTime,
} from "@/src/features/batch-templates/utils/batch-template-display.utils";
import type { BatchTemplate } from "@/src/features/batch-templates/types/batch-template.types";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
};

export function AssignBatchesModal({ open, onClose, onSuccess }: Props) {
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [timings, setTimings] = useState<BatchTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [courseId, setCourseId] = useState("");
  const [mode, setMode] = useState<BatchMode>("OFFLINE");
  const [price, setPrice] = useState("22000");
  const [offerPrice, setOfferPrice] = useState("15000");
  const [startDate, setStartDate] = useState(
    () => new Date().toISOString().split("T")[0]!,
  );
  const [endDate, setEndDate] = useState(
    () => new Date().toISOString().split("T")[0]!,
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setCourseId("");
    setMode("OFFLINE");
    setPrice("22000");
    setOfferPrice("15000");
    setStartDate(new Date().toISOString().split("T")[0]!);
    setEndDate(new Date().toISOString().split("T")[0]!);
    setSelectedIds([]);

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const [courseItems, timingItems] = await Promise.all([
          batchService.getCourses(),
          batchTemplateService.listTemplates({ isActive: true }),
        ]);
        if (!cancelled) {
          setCourses(courseItems);
          setTimings(timingItems);
        }
      } catch (error) {
        if (!cancelled) {
          appToast.error(getErrorMessage(error));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [open]);

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

  const filteredTimings = useMemo(
    () => timings.filter((timing) => timing.mode === mode && timing.isActive),
    [timings, mode],
  );

  useEffect(() => {
    setSelectedIds((prev) =>
      prev.filter((id) => filteredTimings.some((timing) => timing.id === id)),
    );
  }, [filteredTimings]);

  const priceNumber = Number(price) || 0;
  const offerNumber =
    offerPrice.trim() === "" ? priceNumber : Number(offerPrice) || 0;
  const discountAmount = Math.max(0, priceNumber - offerNumber);

  const canAssign =
    Boolean(courseId) &&
    selectedIds.length > 0 &&
    Boolean(startDate) &&
    Boolean(endDate) &&
    endDate >= startDate &&
    priceNumber >= 0 &&
    offerNumber >= 0 &&
    offerNumber <= priceNumber;

  const toggleTiming = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleAssign = async () => {
    if (!canAssign) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await batchTemplateService.createBatchesFromTemplates({
        courseId,
        startDate,
        endDate,
        templateIds: selectedIds,
        originalPrice: priceNumber,
        discountedPrice: offerNumber,
        discountAmount,
        currency: "INR",
        isFree: priceNumber === 0,
      });

      const { createdCount, failedCount, results } = response.data;

      if (failedCount === 0) {
        appToast.success(
          response.message ||
            `${createdCount} batch(es) assigned successfully`,
        );
        await onSuccess();
        onClose();
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
        onClose();
      } else {
        appToast.error(failedNames || response.message);
      }
    } catch (error) {
      appToast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const assignLabel =
    selectedIds.length === 1
      ? "Assign 1 Batch"
      : `Assign ${selectedIds.length} Batches`;

  return (
    <Modal
      open={open}
      title="Assign Batches"
      onClose={onClose}
      contentClassName="!flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-2xl flex-col !overflow-hidden"
    >
      <div className="space-y-5">
        <section className="space-y-2">
          <Label>Course</Label>
          <AppSelect
            value={courseId || undefined}
            onValueChange={setCourseId}
            options={courseOptions}
            placeholder={loading ? "Loading courses..." : "Select Course"}
            disabled={loading}
          />
        </section>

        <section className="space-y-2">
          <Label>Mode</Label>
          <AppSelect
            value={mode}
            onValueChange={(value) => setMode(value as BatchMode)}
            options={FILTER_BATCH_MODES}
            placeholder="Select mode"
          />
        </section>

        <section className="space-y-3">
          <Label>Course Price</Label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="assign-price">Price</Label>
              <Input
                id="assign-price"
                type="number"
                min={0}
                step="1"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="22000"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="assign-offer">Offer Price (optional)</Label>
              <Input
                id="assign-offer"
                type="number"
                min={0}
                step="1"
                value={offerPrice}
                onChange={(event) => setOfferPrice(event.target.value)}
                placeholder="15000"
              />
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Label>Select Batch Timings</Label>
            <p className="text-sm text-slate-500">
              {selectedIds.length} batch timing
              {selectedIds.length === 1 ? "" : "s"} selected
            </p>
          </div>

          {loading ? (
            <p className="text-sm text-slate-500">Loading timings...</p>
          ) : filteredTimings.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
              No active {formatTemplateMode(mode)} timings. Add them under Batch
              Timings first.
            </p>
          ) : (
            <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
              {filteredTimings.map((timing) => {
                const checked = selectedIds.includes(timing.id);
                return (
                  <label
                    key={timing.id}
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
                      onChange={() => toggleTiming(timing.id)}
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-[#102A56]">
                        {timing.name}
                      </span>
                      <span className="mt-1 block text-xs text-slate-500">
                        {formatTemplateMode(timing.mode)}
                      </span>
                      <span className="mt-0.5 block text-xs text-slate-500">
                        {timing.hasFixedTime
                          ? formatTemplateDays(timing.daysOfWeek)
                          : "Anytime"}
                      </span>
                      <span className="mt-0.5 block text-xs text-slate-500">
                        {formatTemplateTime(timing)}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <Label>Batch Duration</Label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="assign-start">Start Date</Label>
              <Input
                id="assign-start"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="assign-end">End Date</Label>
              <Input
                id="assign-end"
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </div>
          </div>
        </section>

        <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            loading={submitting}
            disabled={!canAssign || submitting}
            onClick={() => {
              void handleAssign();
            }}
          >
            {assignLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
