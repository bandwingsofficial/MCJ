"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
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
import { formatCurrency } from "@/src/features/enrollments/utils/format-payment";

function formatPreviewDate(value: string): string {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function AssignBatchesPage() {
  const router = useRouter();

  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [timings, setTimings] = useState<BatchTemplate[]>([]);
  const [loading, setLoading] = useState(true);
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

  const selectedCourse = courses.find((course) => course.id === courseId);

  const filteredTimings = useMemo(
    () => timings.filter((timing) => timing.mode === mode && timing.isActive),
    [timings, mode],
  );

  useEffect(() => {
    setSelectedIds((prev) =>
      prev.filter((id) => filteredTimings.some((timing) => timing.id === id)),
    );
  }, [filteredTimings]);

  const selectedTimings = filteredTimings.filter((timing) =>
    selectedIds.includes(timing.id),
  );

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
        router.push("/batches");
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
        router.push("/batches");
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
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#102A56]">
          Assign Batches
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Choose a course, set pricing, and assign available batch timings.
        </p>
      </div>

      <Card className="space-y-6 border-slate-200 p-6 shadow-none">
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-[#102A56]">Course</h2>
          <AppSelect
            value={courseId || undefined}
            onValueChange={setCourseId}
            options={courseOptions}
            placeholder={loading ? "Loading courses..." : "Select a course"}
            disabled={loading}
          />
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-[#102A56]">Mode</h2>
          <AppSelect
            value={mode}
            onValueChange={(value) => setMode(value as BatchMode)}
            options={FILTER_BATCH_MODES}
            placeholder="Select mode"
          />
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[#102A56]">
            Course Price
          </h2>
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
            <h2 className="text-base font-semibold text-[#102A56]">
              Select Batch Timings
            </h2>
            <p className="text-sm text-slate-500">
              {selectedIds.length} batch timing
              {selectedIds.length === 1 ? "" : "s"} selected
            </p>
          </div>

          {loading ? (
            <p className="text-sm text-slate-500">Loading timings...</p>
          ) : filteredTimings.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">
              No active {formatTemplateMode(mode)} timings. Add them under Batch
              Timings first.
            </p>
          ) : (
            <div className="space-y-2">
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
          <h2 className="text-base font-semibold text-[#102A56]">Duration</h2>
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

        <section className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <h2 className="text-base font-semibold text-[#102A56]">Preview</h2>
          <div className="mt-4 space-y-2 text-sm text-slate-700">
            <p className="text-base font-semibold text-[#102A56]">
              {selectedCourse?.title ?? "Select a course"}
            </p>
            <p>
              <span className="text-slate-500">Price:</span>{" "}
              {formatCurrency(priceNumber)}
            </p>
            {offerPrice.trim() !== "" && offerNumber !== priceNumber ? (
              <p>
                <span className="text-slate-500">Offer Price:</span>{" "}
                {formatCurrency(offerNumber)}
              </p>
            ) : null}
            <p>
              <span className="text-slate-500">Start:</span>{" "}
              {formatPreviewDate(startDate)}
            </p>
            <p>
              <span className="text-slate-500">End:</span>{" "}
              {formatPreviewDate(endDate)}
            </p>
          </div>

          <div className="mt-4">
            <p className="text-sm font-medium text-slate-500">
              Selected Batches:
            </p>
            {selectedTimings.length === 0 ? (
              <p className="mt-2 text-sm text-slate-400">None selected</p>
            ) : (
              <ul className="mt-2 space-y-3">
                {selectedTimings.map((timing) => (
                  <li
                    key={timing.id}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2"
                  >
                    <p className="text-sm font-semibold text-[#102A56]">
                      {timing.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatTemplateMode(timing.mode)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {timing.hasFixedTime
                        ? formatTemplateDays(timing.daysOfWeek)
                        : "Anytime"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatTemplateTime(timing)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/batches")}
          >
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
      </Card>
    </div>
  );
}
