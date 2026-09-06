"use client";

import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";

import { Modal } from "@/src/shared/components/ui/model";
import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";
import { AppSelect } from "@/src/shared/components/ui/select";
import {
  type FieldVisualState,
  ValidatedField,
  validatedFieldInputClass,
} from "@/src/shared/components/ui/validated-field";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";
import { cn } from "@/src/shared/lib/cn";

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

type LastEditedDiscount = "PERCENTAGE" | "AMOUNT";

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function roundPercent(value: number): number {
  return Math.round(value * 100) / 100;
}

function parseNumeric(value: string): number | null {
  if (value.trim() === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatAmountInput(value: number): string {
  if (!Number.isFinite(value)) {
    return "0";
  }
  return String(roundMoney(value));
}

function formatPercentInput(value: number): string {
  if (!Number.isFinite(value)) {
    return "0";
  }
  return String(roundPercent(value));
}

function getOriginalPriceError(value: string): string | null {
  const parsed = parseNumeric(value);
  if (parsed === null || parsed <= 0) {
    return "Enter a valid price.";
  }
  return null;
}

function getDiscountPercentError(value: string): string | null {
  const parsed = parseNumeric(value);
  if (parsed === null || parsed < 0) {
    return "Enter a valid discount percentage.";
  }
  if (parsed > 100) {
    return "Discount percentage cannot exceed 100%.";
  }
  return null;
}

function getDiscountAmountError(
  value: string,
  originalPrice: number | null,
): string | null {
  const parsed = parseNumeric(value);
  if (parsed === null || parsed < 0) {
    return "Enter a valid discount amount.";
  }
  if (
    originalPrice !== null &&
    originalPrice > 0 &&
    parsed > originalPrice
  ) {
    return "Discount amount cannot be greater than original price.";
  }
  return null;
}

function fieldState(
  error: string | null,
  touched: boolean,
): FieldVisualState {
  if (error) {
    return "invalid";
  }
  if (touched) {
    return "valid";
  }
  return "neutral";
}

export function AssignBatchesModal({ open, onClose, onSuccess }: Props) {
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [timings, setTimings] = useState<BatchTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [courseId, setCourseId] = useState("");
  const [batchName, setBatchName] = useState("");
  const [batchNameTouched, setBatchNameTouched] = useState(false);
  const [batchNumber, setBatchNumber] = useState("");
  const [loadingBatchNumber, setLoadingBatchNumber] = useState(false);
  const [mode, setMode] = useState<BatchMode>("OFFLINE");
  const [originalPrice, setOriginalPrice] = useState("22000");
  const [discountPercent, setDiscountPercent] = useState("0");
  const [discountAmount, setDiscountAmount] = useState("0");
  const [lastEditedDiscount, setLastEditedDiscount] =
    useState<LastEditedDiscount>("PERCENTAGE");
  const [priceTouched, setPriceTouched] = useState(false);
  const [percentTouched, setPercentTouched] = useState(false);
  const [amountTouched, setAmountTouched] = useState(false);
  const [startDate, setStartDate] = useState(
    () => new Date().toISOString().split("T")[0]!,
  );
  const [endDate, setEndDate] = useState(
    () => new Date().toISOString().split("T")[0]!,
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const resetPricing = () => {
    setOriginalPrice("22000");
    setDiscountPercent("0");
    setDiscountAmount("0");
    setLastEditedDiscount("PERCENTAGE");
    setPriceTouched(false);
    setPercentTouched(false);
    setAmountTouched(false);
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    setCourseId("");
    setBatchName("");
    setBatchNameTouched(false);
    setBatchNumber("");
    setMode("OFFLINE");
    resetPricing();
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

  useEffect(() => {
    if (!open || !startDate) {
      return;
    }

    let cancelled = false;

    const loadBatchNumber = async () => {
      setLoadingBatchNumber(true);
      try {
        const response = await batchService.suggestBatchCode(startDate);
        if (!cancelled) {
          setBatchNumber(response.data.batchCode);
        }
      } catch {
        if (!cancelled) {
          setBatchNumber("");
        }
      } finally {
        if (!cancelled) {
          setLoadingBatchNumber(false);
        }
      }
    };

    void loadBatchNumber();
    return () => {
      cancelled = true;
    };
  }, [open, startDate]);

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

  const originalPriceNumber = parseNumeric(originalPrice);
  const discountPercentNumber = parseNumeric(discountPercent);
  const discountAmountNumber = parseNumeric(discountAmount);

  const originalPriceError = getOriginalPriceError(originalPrice);
  const discountPercentError = getDiscountPercentError(discountPercent);
  const discountAmountError = getDiscountAmountError(
    discountAmount,
    originalPriceNumber,
  );

  const originalPriceState = fieldState(originalPriceError, priceTouched);
  const discountPercentState = fieldState(discountPercentError, percentTouched);
  const discountAmountState = fieldState(discountAmountError, amountTouched);

  const finalAmount =
    originalPriceNumber !== null &&
    discountAmountNumber !== null &&
    originalPriceNumber > 0 &&
    discountAmountNumber >= 0
      ? roundMoney(Math.max(0, originalPriceNumber - discountAmountNumber))
      : 0;

  const pricingValid =
    !originalPriceError &&
    !discountPercentError &&
    !discountAmountError &&
    originalPriceNumber !== null &&
    originalPriceNumber > 0 &&
    discountPercentNumber !== null &&
    discountAmountNumber !== null &&
    finalAmount >= 0;

  const batchNameError =
    batchName.trim().length === 0 ? "Enter a batch name." : null;
  const batchNameState = fieldState(batchNameError, batchNameTouched);

  const canAssign =
    Boolean(courseId) &&
    Boolean(batchName.trim()) &&
    Boolean(mode) &&
    selectedIds.length > 0 &&
    Boolean(startDate) &&
    Boolean(endDate) &&
    endDate >= startDate &&
    pricingValid;

  const syncAmountFromPercent = (percentRaw: string, priceRaw: string) => {
    const percent = parseNumeric(percentRaw);
    const price = parseNumeric(priceRaw);
    if (percent === null || price === null || percent < 0 || price <= 0) {
      return;
    }
    setDiscountAmount(formatAmountInput((price * percent) / 100));
  };

  const syncPercentFromAmount = (amountRaw: string, priceRaw: string) => {
    const amount = parseNumeric(amountRaw);
    const price = parseNumeric(priceRaw);
    if (amount === null || price === null || amount < 0 || price <= 0) {
      return;
    }
    setDiscountPercent(formatPercentInput((amount / price) * 100));
  };

  const handleOriginalPriceChange = (value: string) => {
    setOriginalPrice(value);
    setPriceTouched(true);

    if (lastEditedDiscount === "PERCENTAGE") {
      syncAmountFromPercent(discountPercent, value);
      setAmountTouched(true);
    } else {
      syncPercentFromAmount(discountAmount, value);
      setPercentTouched(true);
    }
  };

  const handleDiscountPercentChange = (value: string) => {
    setLastEditedDiscount("PERCENTAGE");
    setDiscountPercent(value);
    setPercentTouched(true);
    syncAmountFromPercent(value, originalPrice);
    setAmountTouched(true);
  };

  const handleDiscountAmountChange = (value: string) => {
    setLastEditedDiscount("AMOUNT");
    setDiscountAmount(value);
    setAmountTouched(true);
    syncPercentFromAmount(value, originalPrice);
    setPercentTouched(true);
  };

  const toggleTiming = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleAssign = async () => {
    setBatchNameTouched(true);
    setPriceTouched(true);
    setPercentTouched(true);
    setAmountTouched(true);

    if (!canAssign || originalPriceNumber === null || discountAmountNumber === null) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await batchTemplateService.createBatchesFromTemplates({
        courseId,
        name: batchName.trim(),
        startDate,
        endDate,
        templateIds: selectedIds,
        originalPrice: originalPriceNumber,
        discountedPrice: finalAmount,
        discountAmount: discountAmountNumber,
        currency: "INR",
        isFree: originalPriceNumber === 0,
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

  const selectedCountLabel =
    selectedIds.length === 1
      ? "1 batch timing selected"
      : `${selectedIds.length} batch timings selected`;

  return (
    <Modal
      open={open}
      title="Assign Batches"
      onClose={onClose}
      contentClassName="!flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-3xl flex-col !overflow-hidden"
      bodyClassName="!py-4"
      footer={
        <>
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
            Assign Batches
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ValidatedField
            label="Batch Name"
            required
            state={batchNameState}
            errorMessage={batchNameError}
          >
            <Input
              id="assign-batch-name"
              value={batchName}
              onChange={(event) => {
                setBatchName(event.target.value);
                setBatchNameTouched(true);
              }}
              onBlur={() => setBatchNameTouched(true)}
              placeholder="Enter batch name"
              className={validatedFieldInputClass(batchNameState)}
            />
          </ValidatedField>
          <div className="space-y-1.5">
            <Label>Batch Number</Label>
            <div className="flex min-h-10 w-full flex-col justify-center rounded-md border border-[#D9E3F0] bg-slate-50 px-3 py-1.5">
              <span className="text-sm font-semibold leading-tight text-[#102A56]">
                {loadingBatchNumber
                  ? "Generating..."
                  : batchNumber
                    ? `#${batchNumber}`
                    : "—"}
              </span>
              <span className="text-[11px] leading-tight text-[#8AA0BB]">
                Auto-generated
              </span>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label required>Course</Label>
            <AppSelect
              value={courseId || undefined}
              onValueChange={setCourseId}
              options={courseOptions}
              placeholder={loading ? "Loading courses..." : "Select Course"}
              disabled={loading}
            />
          </div>
          <div className="space-y-1.5">
            <Label required>Mode</Label>
            <AppSelect
              value={mode}
              onValueChange={(value) => setMode(value as BatchMode)}
              options={FILTER_BATCH_MODES}
              placeholder="Select mode"
            />
          </div>
        </div>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-[#102A56]">
            Course Pricing
          </h3>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ValidatedField
              label="Original Price"
              required
              state={originalPriceState}
              errorMessage={originalPriceError}
              leftIcon={<span className="text-sm text-[#8AA0BB]">₹</span>}
            >
              <Input
                id="assign-original-price"
                type="number"
                min={0}
                step="1"
                value={originalPrice}
                onChange={(event) =>
                  handleOriginalPriceChange(event.target.value)
                }
                onBlur={() => setPriceTouched(true)}
                placeholder="22000"
                className={validatedFieldInputClass(
                  originalPriceState,
                  undefined,
                  { leftIcon: true },
                )}
              />
            </ValidatedField>

            <ValidatedField
              label="Discount Amount"
              required
              state={discountAmountState}
              errorMessage={discountAmountError}
              leftIcon={<span className="text-sm text-[#8AA0BB]">₹</span>}
            >
              <Input
                id="assign-discount-amount"
                type="number"
                min={0}
                step="1"
                value={discountAmount}
                onChange={(event) =>
                  handleDiscountAmountChange(event.target.value)
                }
                onBlur={() => setAmountTouched(true)}
                placeholder="0"
                className={validatedFieldInputClass(
                  discountAmountState,
                  undefined,
                  { leftIcon: true },
                )}
              />
            </ValidatedField>

            <ValidatedField
              label="Discount Percentage"
              required
              state={discountPercentState}
              errorMessage={discountPercentError}
            >
              <div className="relative">
                <Input
                  id="assign-discount-percent"
                  type="number"
                  min={0}
                  max={100}
                  step="0.01"
                  value={discountPercent}
                  onChange={(event) =>
                    handleDiscountPercentChange(event.target.value)
                  }
                  onBlur={() => setPercentTouched(true)}
                  placeholder="0"
                  className={cn(
                    validatedFieldInputClass(discountPercentState),
                    "pr-14",
                  )}
                />
                <span className="pointer-events-none absolute right-9 top-1/2 -translate-y-1/2 text-sm font-medium text-[#8AA0BB]">
                  %
                </span>
              </div>
            </ValidatedField>

            <div className="min-w-0 space-y-1.5">
              <Label>Final Amount</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2 text-sm text-[#8AA0BB]">
                  ₹
                </span>
                <Input
                  id="assign-final-amount"
                  readOnly
                  tabIndex={-1}
                  value={formatAmountInput(finalAmount)}
                  className="cursor-default bg-slate-50 pl-7 text-[#102A56]"
                />
              </div>
              <div className="min-h-[1.25rem]" aria-hidden="true" />
            </div>
          </div>
        </section>

        <section className="space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Label required>Select Batch Timings</Label>
            <p className="text-sm text-[#647A9B]">{selectedCountLabel}</p>
          </div>

          {loading ? (
            <p className="text-sm text-slate-500">Loading timings...</p>
          ) : filteredTimings.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
              No active {formatTemplateMode(mode)} timings. Add them under Batch
              Timings first.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTimings.map((timing) => {
                const checked = selectedIds.includes(timing.id);
                return (
                  <button
                    key={timing.id}
                    type="button"
                    onClick={() => toggleTiming(timing.id)}
                    aria-pressed={checked}
                    className={`flex min-h-[4.5rem] items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                      checked
                        ? "border-[#2563EB] bg-[#EFF6FF] shadow-[0_0_0_1px_rgba(37,99,235,0.2)]"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                        checked
                          ? "border-[#2563EB] bg-[#2563EB] text-white"
                          : "border-slate-300 bg-white"
                      }`}
                      aria-hidden="true"
                    >
                      {checked ? (
                        <Check className="h-3 w-3" strokeWidth={3} />
                      ) : null}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-[#102A56]">
                        {timing.name}
                      </span>
                      <span className="mt-0.5 block text-xs text-[#647A9B]">
                        {timing.hasFixedTime
                          ? `${formatTemplateDays(timing.daysOfWeek)} · ${formatTemplateTime(timing)}`
                          : "Self-paced"}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
      </div>
    </Modal>
  );
}
