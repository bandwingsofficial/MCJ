"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";

import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";
import { AppSelect } from "@/src/shared/components/ui/select";
import { Loader } from "@/src/shared/components/ui/loader";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/shared/components/ui/tabs";
import {
  type FieldVisualState,
  ValidatedField,
  validatedFieldInputClass,
} from "@/src/shared/components/ui/validated-field";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { FILTER_BATCH_MODES } from "@/src/features/batches/constants/batch.constants";
import { BatchDurationField } from "@/src/features/batches/components/batch-duration-field";
import {
  AssignBatchModeTabPanel,
  createDefaultModeTabState,
  getModeTabFinalAmount,
  isModeTabPricingValid,
  type ModeTabFormState,
} from "@/src/features/batches/components/assign-batch-mode-tab-panel";
import { DEFAULT_BATCH_DURATION } from "@/src/features/batches/schemas/batch.schema";
import { batchService } from "@/src/features/batches/services/batch.service";
import type {
  Batch,
  BatchMode,
  BatchModeConfigRequest,
  CourseOption,
} from "@/src/features/batches/types/batch.types";
import {
  BATCH_MODE_ORDER,
  getBatchModeLabel,
  getBatchModePricingMap,
  getBatchModes,
  getTimingsForMode,
} from "@/src/features/batches/utils/batch-mode.utils";
import {
  getBatchDurationErrorMessage,
  getBatchDurationFieldStates,
  parseBatchDuration,
} from "@/src/features/batches/utils/batch-duration.utils";
import {
  batchToAssignFormInitial,
  formatAmountInput,
  formatPercentInput,
  type AssignBatchFormSubmitPayload,
} from "@/src/features/batches/utils/assign-batch-form.utils";
import { uniqueSelectOptions } from "@/src/features/batches/utils/batch-select.utils";
import { batchTemplateService } from "@/src/features/batch-templates/services/batch-template.service";
import type { BatchTemplate } from "@/src/features/batch-templates/types/batch-template.types";

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

function buildModeTabStateFromBatch(
  batch: Batch,
  mode: BatchMode,
): ModeTabFormState {
  const pricingMap = getBatchModePricingMap(batch);
  const pricing = pricingMap[mode];
  const selectedIds = getTimingsForMode(batch, mode)
    .map((timing) => timing.batchTemplateId)
    .filter((id): id is string => Boolean(id));

  if (!pricing && selectedIds.length === 0) {
    return createDefaultModeTabState();
  }

  const originalPrice = pricing?.originalPrice ?? 22000;
  const discountAmount = pricing?.discountAmount ?? 0;
  const discountPercent =
    pricing?.discountPercent ??
    (originalPrice > 0 ? (discountAmount / originalPrice) * 100 : 0);

  return {
    originalPrice: formatAmountInput(originalPrice),
    discountPercent: formatPercentInput(discountPercent),
    discountAmount: formatAmountInput(discountAmount),
    lastEditedDiscount: "PERCENTAGE",
    selectedIds,
    priceTouched: false,
    percentTouched: false,
    amountTouched: false,
  };
}

function buildModeStatesFromBatch(batch: Batch): Record<BatchMode, ModeTabFormState> {
  const modes = getBatchModes(batch);

  if (modes.length === 0) {
    const initial = batchToAssignFormInitial(batch);
    return {
      OFFLINE: createDefaultModeTabState(),
      ONLINE: createDefaultModeTabState(),
      RECORDED: createDefaultModeTabState(),
      [initial.mode]: {
        originalPrice: initial.originalPrice,
        discountPercent: initial.discountPercent,
        discountAmount: initial.discountAmount,
        lastEditedDiscount: "PERCENTAGE",
        selectedIds: initial.selectedIds,
        priceTouched: false,
        percentTouched: false,
        amountTouched: false,
      },
    };
  }

  return {
    OFFLINE: buildModeTabStateFromBatch(batch, "OFFLINE"),
    ONLINE: buildModeTabStateFromBatch(batch, "ONLINE"),
    RECORDED: buildModeTabStateFromBatch(batch, "RECORDED"),
  };
}

function getInitialActiveTab(batch: Batch): BatchMode {
  const configured = BATCH_MODE_ORDER.filter(
    (mode) => getTimingsForMode(batch, mode).length > 0,
  );
  return configured[0] ?? batch.mode ?? "OFFLINE";
}

export interface AssignBatchEditFormHandle {
  submit: () => void;
}

interface Props {
  open?: boolean;
  batch?: Batch | null;
  batchLoading?: boolean;
  idPrefix?: string;
  onCanSubmitChange?: (canSubmit: boolean) => void;
  onSubmit: (payload: AssignBatchFormSubmitPayload) => Promise<void>;
}

export const AssignBatchEditForm = forwardRef<
  AssignBatchEditFormHandle,
  Props
>(function AssignBatchEditForm(
  {
    open = true,
    batch = null,
    batchLoading = false,
    idPrefix = "edit",
    onCanSubmitChange,
    onSubmit,
  },
  ref,
) {
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [timings, setTimings] = useState<BatchTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<BatchMode>("OFFLINE");

  const [courseId, setCourseId] = useState("");
  const [batchName, setBatchName] = useState("");
  const [batchNameTouched, setBatchNameTouched] = useState(false);
  const [batchNumber, setBatchNumber] = useState("");
  const [durationValue, setDurationValue] = useState(
    DEFAULT_BATCH_DURATION.durationValue,
  );
  const [durationType, setDurationType] = useState(
    DEFAULT_BATCH_DURATION.durationType,
  );
  const [durationTouched, setDurationTouched] = useState(false);
  const [startDate, setStartDate] = useState(
    () => new Date().toISOString().split("T")[0]!,
  );
  const [endDate, setEndDate] = useState(
    () => new Date().toISOString().split("T")[0]!,
  );
  const [modeStates, setModeStates] = useState<
    Record<BatchMode, ModeTabFormState>
  >({
    OFFLINE: createDefaultModeTabState(),
    ONLINE: createDefaultModeTabState(),
    RECORDED: createDefaultModeTabState(),
  });

  const batchTimingTemplateIds = (batch?.timings ?? [])
    .map((timing) => timing.batchTemplateId)
    .join(",");

  const hydrateFromBatch = (source: Batch) => {
    const initial = batchToAssignFormInitial(source);
    setBatchName(initial.batchName);
    setBatchNumber(initial.batchNumber);
    setCourseId(initial.courseId);
    setDurationValue(initial.durationValue);
    setDurationType(initial.durationType);
    setStartDate(initial.startDate);
    setEndDate(initial.endDate);
    setModeStates(buildModeStatesFromBatch(source));
    setActiveTab(getInitialActiveTab(source));
    setBatchNameTouched(false);
    setDurationTouched(false);
  };

  useEffect(() => {
    if (!open || !batch) {
      return;
    }
    hydrateFromBatch(batch);
  }, [open, batch?.id, batch?.updatedAt, batchTimingTemplateIds]);

  useEffect(() => {
    if (!open) {
      return;
    }

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

  const durationValidation = useMemo(
    () => parseBatchDuration({ durationValue, durationType }),
    [durationType, durationValue],
  );
  const durationError = getBatchDurationErrorMessage(durationValidation);
  const { valueState: durationValueState, typeState: durationTypeState } =
    getBatchDurationFieldStates(durationTouched, durationError);

  const batchNameError =
    batchName.trim().length === 0 ? "Enter a batch name." : null;
  const batchNameState = fieldState(batchNameError, batchNameTouched);

  const configuredModes = BATCH_MODE_ORDER.filter(
    (mode) => modeStates[mode].selectedIds.length > 0,
  );

  const canSubmit =
    Boolean(courseId) &&
    Boolean(batchName.trim()) &&
    Boolean(startDate) &&
    Boolean(endDate) &&
    endDate >= startDate &&
    durationValidation.success &&
    configuredModes.length > 0 &&
    configuredModes.every((mode) => isModeTabPricingValid(modeStates[mode]));

  useEffect(() => {
    onCanSubmitChange?.(canSubmit);
  }, [canSubmit, onCanSubmitChange]);

  const handleSubmit = async () => {
    setBatchNameTouched(true);
    setDurationTouched(true);

    if (!canSubmit || !durationValidation.success) {
      return;
    }

    const modeConfigs: BatchModeConfigRequest[] = configuredModes.map(
      (mode) => {
        const state = modeStates[mode];
        const originalPrice = Number(state.originalPrice);
        const discountAmount = Number(state.discountAmount);
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
      courseId,
      name: batchName.trim(),
      mode: primary.mode,
      startDate,
      endDate,
      templateIds: modeConfigs.flatMap((config) => config.templateIds),
      modeConfigs,
      durationValue: durationValidation.data.durationValue,
      durationType: durationValidation.data.durationType,
      originalPrice: primary.originalPrice ?? 0,
      discountAmount: primary.discountAmount ?? 0,
      discountedPrice: primary.discountedPrice ?? 0,
      currency: primary.currency ?? "INR",
      isFree: primary.isFree ?? false,
    });
  };

  useImperativeHandle(ref, () => ({
    submit: () => {
      void handleSubmit();
    },
  }));

  if (batchLoading && !batch) {
    return <Loader />;
  }

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <header className="border-b border-slate-200 bg-[#F6F9FD] px-4 py-3">
          <h3 className="text-sm font-semibold text-[#102A56]">
            Common Batch Details
          </h3>
          <p className="mt-0.5 text-xs text-[#647A9B]">
            Shared information that applies to all learning modes.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
          <ValidatedField
            label="Batch Name"
            required
            state={batchNameState}
            errorMessage={batchNameError}
          >
            <Input
              id={`${idPrefix}-batch-name`}
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
                {batchNumber ? `#${batchNumber}` : "—"}
              </span>
              <span className="text-[11px] leading-tight text-[#8AA0BB]">
                Auto-generated
              </span>
            </div>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label required>Course</Label>
            <AppSelect
              value={courseId || undefined}
              onValueChange={setCourseId}
              options={courseOptions}
              placeholder={loading ? "Loading courses..." : "Select Course"}
              disabled={loading}
            />
          </div>

          <div className="sm:col-span-2">
            <BatchDurationField
              idPrefix={idPrefix}
              durationValue={durationValue}
              durationType={durationType}
              onDurationValueChange={(value) => {
                setDurationValue(value);
                setDurationTouched(true);
              }}
              onDurationTypeChange={(value) => {
                setDurationType(value);
                setDurationTouched(true);
              }}
              onDurationValueBlur={() => setDurationTouched(true)}
              valueState={durationValueState}
              typeState={durationTypeState}
              errorMessage={durationError}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`${idPrefix}-start`}>Start Date</Label>
            <Input
              id={`${idPrefix}-start`}
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${idPrefix}-end`}>End Date</Label>
            <Input
              id={`${idPrefix}-end`}
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-[#102A56]">
            Learning Modes
          </h3>
          <p className="mt-0.5 text-xs text-[#647A9B]">
            Configure pricing and batch timings for each mode in its own section.
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
                loadingTemplates={loading}
                onChange={(next) => {
                  setModeStates((prev) => ({ ...prev, [value]: next }));
                }}
              />
            </TabsContent>
          ))}
        </Tabs>
      </section>

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
  );
});
