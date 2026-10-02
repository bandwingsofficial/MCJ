"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/shared/components/ui/tabs";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { BatchForm } from "@/src/features/batches/components/BatchForm";
import { FILTER_BATCH_MODES } from "@/src/features/batches/constants/batch.constants";
import {
  AssignBatchModeTabPanel,
  createDefaultModeTabState,
  type ModeTabFormState,
} from "@/src/features/batches/components/assign-batch-mode-tab-panel";
import {
  getEffectiveDiscountAmount,
  getModeTabFinalAmount,
  isModeTabPricingValid,
} from "@/src/features/batches/utils/assign-batch-form.utils";
import { batchTemplateService } from "@/src/features/batch-templates/services/batch-template.service";
import type { BatchTemplate } from "@/src/features/batch-templates/types/batch-template.types";
import type {
  BatchMode,
  BatchModeConfigRequest,
} from "@/src/features/batches/types/batch.types";
import {
  BATCH_MODE_ORDER,
  getBatchModeLabel,
} from "@/src/features/batches/utils/batch-mode.utils";
import {
  formatAmountInput,
  type AssignBatchFormSubmitPayload,
} from "@/src/features/batches/utils/assign-batch-form.utils";

interface Props {
  open?: boolean;
  idPrefix?: string;
  isSubmitting?: boolean;
  onCancel?: () => void;
  onSubmit: (payload: AssignBatchFormSubmitPayload) => Promise<void>;
}

export function AssignBatchCreateForm({
  open = true,
  idPrefix = "assign",
  isSubmitting = false,
  onCancel,
  onSubmit,
}: Props) {
  const [formSessionKey, setFormSessionKey] = useState(0);
  const [timings, setTimings] = useState<BatchTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [activeTab, setActiveTab] = useState<BatchMode>("OFFLINE");
  const [modeStates, setModeStates] = useState<
    Record<BatchMode, ModeTabFormState>
  >({
    OFFLINE: createDefaultModeTabState(),
    ONLINE: createDefaultModeTabState(),
    RECORDED: createDefaultModeTabState(),
  });

  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setFormSessionKey((value) => value + 1);
      setActiveTab("OFFLINE");
      setModeStates({
        OFFLINE: createDefaultModeTabState(),
        ONLINE: createDefaultModeTabState(),
        RECORDED: createDefaultModeTabState(),
      });
    }
    wasOpenRef.current = open;
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoadingTemplates(true);
      try {
        const timingItems = await batchTemplateService.listTemplates({
          isActive: true,
        });
        if (!cancelled) {
          setTimings(timingItems);
        }
      } catch (error) {
        if (!cancelled) {
          appToast.error(getErrorMessage(error));
        }
      } finally {
        if (!cancelled) {
          setLoadingTemplates(false);
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const configuredModes = BATCH_MODE_ORDER.filter(
    (mode) => modeStates[mode].selectedIds.length > 0,
  );

  const modesReady =
    configuredModes.length > 0 &&
    configuredModes.every((mode) => isModeTabPricingValid(modeStates[mode]));

  const modeTabsSection = useMemo(
    () => (
      <div className="md:col-span-2 space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-[#102A56]">
            Learning Modes
          </h3>
          <p className="mt-0.5 text-xs text-[#647A9B]">
            Configure pricing and batch timings for each mode in its own
            section.
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as BatchMode)}
          className="space-y-3"
        >
          <TabsList className="grid h-auto w-full grid-cols-1 gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 sm:grid-cols-3">
            {FILTER_BATCH_MODES.map(({ value, label }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="whitespace-normal rounded-lg px-2 py-2.5 text-xs font-medium data-[state=active]:border data-[state=active]:border-slate-200 data-[state=active]:bg-white data-[state=active]:text-[#102A56] data-[state=active]:shadow-sm sm:text-sm"
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {FILTER_BATCH_MODES.map(({ value }) => (
            <TabsContent
              key={value}
              value={value}
              className="mt-0 focus-visible:outline-none"
            >
              <AssignBatchModeTabPanel
                mode={value}
                idPrefix={idPrefix}
                state={modeStates[value]}
                templates={timings}
                loadingTemplates={loadingTemplates}
                onChange={(next) => {
                  setModeStates((prev) => ({ ...prev, [value]: next }));
                }}
              />
            </TabsContent>
          ))}
        </Tabs>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm">
          <header className="border-b border-slate-200 bg-white px-4 py-3">
            <h3 className="text-sm font-semibold text-[#102A56]">
              Configured Modes
            </h3>
            <p className="mt-0.5 text-xs text-[#647A9B]">
              Summary of modes configured for this batch.
            </p>
          </header>

          <div className="p-3">
            {configuredModes.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-200 bg-white px-4 py-4 text-sm text-[#647A9B]">
                Select batch timings in at least one mode tab to configure this
                batch.
              </p>
            ) : (
              <div className="space-y-2">
                {configuredModes.map((mode) => {
                  const state = modeStates[mode];
                  return (
                    <div
                      key={mode}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm"
                    >
                      <span className="font-medium text-[#102A56]">
                        {getBatchModeLabel(mode)}
                      </span>
                      <span className="text-[#647A9B]">
                        ₹{formatAmountInput(getModeTabFinalAmount(state))} ·{" "}
                        {state.selectedIds.length} timing
                        {state.selectedIds.length === 1 ? "" : "s"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    ),
    [
      activeTab,
      configuredModes,
      idPrefix,
      loadingTemplates,
      modeStates,
      timings,
    ],
  );

  if (!open) {
    return null;
  }

  return (
    <BatchForm
      formSessionKey={`assign-${formSessionKey}`}
      isSubmitting={isSubmitting}
      submitLabel="Assign Batches"
      loadingLabel="Assigning..."
      onCancel={onCancel}
      afterFields={modeTabsSection}
      onSubmit={async (formValues) => {
        if (!modesReady) {
          appToast.error(
            "Select batch timings and pricing in at least one learning mode.",
          );
          return;
        }

        const modeConfigs: BatchModeConfigRequest[] = configuredModes.map(
          (mode) => {
            const state = modeStates[mode];
            const originalPrice = Number(state.originalPrice);
            const discountAmount = getEffectiveDiscountAmount(state);
            const discountedPrice = getModeTabFinalAmount(state);

            return {
              mode,
              templateIds: state.selectedIds,
              originalPrice,
              discountAmount,
              discountedPrice,
              currency: "INR",
              isFree: originalPrice === 0,
            };
          },
        );

        const primary = modeConfigs[0]!;

        await onSubmit({
          courseId: formValues.courseId,
          name: formValues.name.trim(),
          mode: primary.mode,
          startDate: formValues.startDate,
          endDate: formValues.endDate,
          templateIds: modeConfigs.flatMap((config) => config.templateIds),
          modeConfigs,
          durationValue: formValues.durationValue,
          durationType: formValues.durationType,
          originalPrice: primary.originalPrice ?? 0,
          discountAmount: primary.discountAmount ?? 0,
          discountedPrice: primary.discountedPrice ?? 0,
          currency: primary.currency ?? "INR",
          isFree: primary.isFree ?? false,
        });
      }}
    />
  );
}
