"use client";

import { Check } from "lucide-react";

import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";
import {
  type FieldVisualState,
  ValidatedField,
  validatedFieldInputClass,
} from "@/src/shared/components/ui/validated-field";
import { cn } from "@/src/shared/lib/cn";

import type { BatchMode } from "@/src/features/batches/types/batch.types";
import { getBatchModeLabel } from "@/src/features/batches/utils/batch-mode.utils";
import {
  formatAmountInput,
  getDiscountAmountError,
  getDiscountPercentError,
  getOriginalPriceError,
  parseNumeric,
  roundMoney,
  type LastEditedDiscount,
} from "@/src/features/batches/utils/assign-batch-form.utils";
import {
  formatTemplateDays,
  formatTemplateTime,
} from "@/src/features/batch-templates/utils/batch-template-display.utils";
import type { BatchTemplate } from "@/src/features/batch-templates/types/batch-template.types";

export interface ModeTabFormState {
  originalPrice: string;
  discountPercent: string;
  discountAmount: string;
  lastEditedDiscount: LastEditedDiscount;
  selectedIds: string[];
  priceTouched: boolean;
  percentTouched: boolean;
  amountTouched: boolean;
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

interface Props {
  mode: BatchMode;
  idPrefix: string;
  state: ModeTabFormState;
  templates: BatchTemplate[];
  loadingTemplates: boolean;
  onChange: (next: ModeTabFormState) => void;
}

export function AssignBatchModeTabPanel({
  mode,
  idPrefix,
  state,
  templates,
  loadingTemplates,
  onChange,
}: Props) {
  const filteredTemplates = templates.filter(
    (template) => template.mode === mode && template.isActive,
  );

  const originalPriceNumber = parseNumeric(state.originalPrice);
  const discountPercentNumber = parseNumeric(state.discountPercent);
  const discountAmountNumber = parseNumeric(state.discountAmount);

  const originalPriceError = getOriginalPriceError(state.originalPrice);
  const discountPercentError = getDiscountPercentError(state.discountPercent);
  const discountAmountError = getDiscountAmountError(
    state.discountAmount,
    originalPriceNumber,
  );

  const originalPriceState = fieldState(
    originalPriceError,
    state.priceTouched,
  );
  const discountPercentState = fieldState(
    discountPercentError,
    state.percentTouched,
  );
  const discountAmountState = fieldState(
    discountAmountError,
    state.amountTouched,
  );

  const finalAmount =
    originalPriceNumber !== null &&
    discountAmountNumber !== null &&
    originalPriceNumber > 0 &&
    discountAmountNumber >= 0
      ? roundMoney(Math.max(0, originalPriceNumber - discountAmountNumber))
      : 0;

  const syncAmountFromPercent = (percentRaw: string, priceRaw: string) => {
    const percent = parseNumeric(percentRaw);
    const price = parseNumeric(priceRaw);
    if (percent === null || price === null || percent < 0 || price <= 0) {
      return state.discountAmount;
    }
    return formatAmountInput((price * percent) / 100);
  };

  const syncPercentFromAmount = (amountRaw: string, priceRaw: string) => {
    const amount = parseNumeric(amountRaw);
    const price = parseNumeric(priceRaw);
    if (amount === null || price === null || amount < 0 || price <= 0) {
      return state.discountPercent;
    }
    return formatAmountInput((amount / price) * 100);
  };

  const patch = (partial: Partial<ModeTabFormState>) => {
    onChange({ ...state, ...partial });
  };

  const selectedCountLabel =
    state.selectedIds.length === 1
      ? "1 batch timing selected"
      : `${state.selectedIds.length} batch timings selected`;

  const timingSectionLabel =
    mode === "OFFLINE"
      ? "Offline batch timings"
      : mode === "ONLINE"
        ? "Online batch timings"
        : "Self-paced batch timings";

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-200 bg-[#F6F9FD] px-4 py-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[#102A56]">
          {getBatchModeLabel(mode)}
        </h3>
        <p className="mt-0.5 text-xs text-[#647A9B]">
          Configure pricing and batch timings for this learning mode.
        </p>
      </header>

      <div className="space-y-0 p-4">
        <section className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-[#647A9B]">
            Pricing
          </h4>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ValidatedField
            label="Original Price"
            required
            state={originalPriceState}
            errorMessage={originalPriceError}
            leftIcon={<span className="text-sm text-[#8AA0BB]">₹</span>}
          >
            <Input
              id={`${idPrefix}-${mode}-original-price`}
              type="number"
              min={0}
              step="1"
              value={state.originalPrice}
              onChange={(event) => {
                const value = event.target.value;
                if (state.lastEditedDiscount === "PERCENTAGE") {
                  patch({
                    originalPrice: value,
                    priceTouched: true,
                    discountAmount: syncAmountFromPercent(
                      state.discountPercent,
                      value,
                    ),
                    amountTouched: true,
                  });
                  return;
                }
                patch({
                  originalPrice: value,
                  priceTouched: true,
                  discountPercent: syncPercentFromAmount(
                    state.discountAmount,
                    value,
                  ),
                  percentTouched: true,
                });
              }}
              onBlur={() => patch({ priceTouched: true })}
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
              id={`${idPrefix}-${mode}-discount-amount`}
              type="number"
              min={0}
              step="1"
              value={state.discountAmount}
              onChange={(event) => {
                const value = event.target.value;
                patch({
                  lastEditedDiscount: "AMOUNT",
                  discountAmount: value,
                  amountTouched: true,
                  discountPercent: syncPercentFromAmount(
                    value,
                    state.originalPrice,
                  ),
                  percentTouched: true,
                });
              }}
              onBlur={() => patch({ amountTouched: true })}
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
                id={`${idPrefix}-${mode}-discount-percent`}
                type="number"
                min={0}
                max={100}
                step="0.01"
                value={state.discountPercent}
                onChange={(event) => {
                  const value = event.target.value;
                  patch({
                    lastEditedDiscount: "PERCENTAGE",
                    discountPercent: value,
                    percentTouched: true,
                    discountAmount: syncAmountFromPercent(
                      value,
                      state.originalPrice,
                    ),
                    amountTouched: true,
                  });
                }}
                onBlur={() => patch({ percentTouched: true })}
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

        <div
          className="my-4 border-t border-slate-200"
          role="separator"
          aria-hidden="true"
        />

        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-[#647A9B]">
                Batch Timings
              </h4>
              <Label required className="mt-1 block text-sm text-[#102A56]">
                {timingSectionLabel}
              </Label>
            </div>
            <p className="text-sm text-[#647A9B]">{selectedCountLabel}</p>
          </div>

        {loadingTemplates ? (
          <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
            Loading timings...
          </p>
        ) : filteredTemplates.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
            No active {getBatchModeLabel(mode)} timings. Add them under Batch
            Timings first.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {filteredTemplates.map((timing) => {
              const checked = state.selectedIds.includes(timing.id);
              return (
                <button
                  key={timing.id}
                  type="button"
                  onClick={() => {
                    patch({
                      selectedIds: checked
                        ? state.selectedIds.filter((id) => id !== timing.id)
                        : [...state.selectedIds, timing.id],
                    });
                  }}
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
      </div>
    </article>
  );
}

export function createDefaultModeTabState(): ModeTabFormState {
  return {
    originalPrice: "22000",
    discountPercent: "0",
    discountAmount: "0",
    lastEditedDiscount: "PERCENTAGE",
    selectedIds: [],
    priceTouched: false,
    percentTouched: false,
    amountTouched: false,
  };
}

export function isModeTabPricingValid(state: ModeTabFormState): boolean {
  const originalPriceNumber = parseNumeric(state.originalPrice);
  const discountAmountNumber = parseNumeric(state.discountAmount);
  return (
    !getOriginalPriceError(state.originalPrice) &&
    !getDiscountPercentError(state.discountPercent) &&
    !getDiscountAmountError(state.discountAmount, originalPriceNumber) &&
    originalPriceNumber !== null &&
    originalPriceNumber > 0 &&
    discountAmountNumber !== null &&
    discountAmountNumber >= 0
  );
}

export function getModeTabFinalAmount(state: ModeTabFormState): number {
  const originalPriceNumber = parseNumeric(state.originalPrice);
  const discountAmountNumber = parseNumeric(state.discountAmount);
  if (
    originalPriceNumber === null ||
    discountAmountNumber === null ||
    originalPriceNumber <= 0
  ) {
    return 0;
  }
  return roundMoney(Math.max(0, originalPriceNumber - discountAmountNumber));
}
