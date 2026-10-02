"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
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

import { FILTER_BATCH_MODES } from "@/src/features/batches/constants/batch.constants";
import {
  AssignBatchCommonDetails,
  touchAllAssignBatchDetailFields,
} from "@/src/features/batches/components/assign-batch-common-details";
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
import { DEFAULT_BATCH_DURATION } from "@/src/features/batches/schemas/batch.schema";
import { batchService } from "@/src/features/batches/services/batch.service";
import type {
  BatchMode,
  BatchModeConfigRequest,
  CourseOption,
} from "@/src/features/batches/types/batch.types";
import {
  BATCH_MODE_ORDER,
  getBatchModeLabel,
} from "@/src/features/batches/utils/batch-mode.utils";
import {
  getBatchDurationErrorMessage,
  parseBatchDuration,
} from "@/src/features/batches/utils/batch-duration.utils";
import {
  formatAmountInput,
  type AssignBatchFormSubmitPayload,
} from "@/src/features/batches/utils/assign-batch-form.utils";
import { uniqueSelectOptions } from "@/src/features/batches/utils/batch-select.utils";
import { batchTemplateService } from "@/src/features/batch-templates/services/batch-template.service";
import type { BatchTemplate } from "@/src/features/batch-templates/types/batch-template.types";

export interface AssignBatchCreateFormHandle {
  submit: () => void;
}

interface Props {
  open?: boolean;
  idPrefix?: string;
  onCanSubmitChange?: (canSubmit: boolean) => void;
  onSubmit: (payload: AssignBatchFormSubmitPayload) => Promise<void>;
}

export const AssignBatchCreateForm = forwardRef<
  AssignBatchCreateFormHandle,
  Props
>(function AssignBatchCreateForm(
  { open = true, idPrefix = "assign", onCanSubmitChange, onSubmit },
  ref,
) {
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [timings, setTimings] = useState<BatchTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<BatchMode>("OFFLINE");

  const [courseId, setCourseId] = useState("");
  const [batchName, setBatchName] = useState("");
  const [batchNameTouched, setBatchNameTouched] = useState(false);
  const [courseTouched, setCourseTouched] = useState(false);
  const [startDateTouched, setStartDateTouched] = useState(false);
  const [endDateTouched, setEndDateTouched] = useState(false);
  const [batchNumber, setBatchNumber] = useState("");
  const [loadingBatchNumber, setLoadingBatchNumber] = useState(false);
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

  const resetForm = () => {
    setCourseId("");
    setBatchName("");
    setBatchNameTouched(false);
    setCourseTouched(false);
    setStartDateTouched(false);
    setEndDateTouched(false);
    setBatchNumber("");
    setDurationValue(DEFAULT_BATCH_DURATION.durationValue);
    setDurationType(DEFAULT_BATCH_DURATION.durationType);
    setDurationTouched(false);
    setStartDate(new Date().toISOString().split("T")[0]!);
    setEndDate(new Date().toISOString().split("T")[0]!);
    setActiveTab("OFFLINE");
    setModeStates({
      OFFLINE: createDefaultModeTabState(),
      ONLINE: createDefaultModeTabState(),
      RECORDED: createDefaultModeTabState(),
    });
  };

  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      resetForm();
    }
    wasOpenRef.current = open;
  }, [open]);

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

  const durationValidation = useMemo(
    () => parseBatchDuration({ durationValue, durationType }),
    [durationType, durationValue],
  );
  const durationError = getBatchDurationErrorMessage(durationValidation);

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
    touchAllAssignBatchDetailFields({
      setBatchNameTouched,
      setCourseTouched,
      setDurationTouched,
      setStartDateTouched,
      setEndDateTouched,
    });
    setModeStates((prev) => {
      const next = { ...prev };
      for (const mode of BATCH_MODE_ORDER) {
        next[mode] = {
          ...next[mode],
          priceTouched: true,
          percentTouched: true,
          amountTouched: true,
        };
      }
      return next;
    });

    if (!canSubmit || !durationValidation.success) {
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

  return (
    <div className="space-y-5">
      <AssignBatchCommonDetails
        idPrefix={idPrefix}
        batchName={batchName}
        onBatchNameChange={setBatchName}
        onBatchNameBlur={() => setBatchNameTouched(true)}
        batchNameTouched={batchNameTouched}
        batchNumber={batchNumber}
        loadingBatchNumber={loadingBatchNumber}
        courseId={courseId}
        onCourseChange={(value) => {
          setCourseId(value);
          setCourseTouched(true);
        }}
        courseTouched={courseTouched}
        courseOptions={courseOptions}
        coursesLoading={loading}
        durationValue={durationValue}
        durationType={durationType}
        onDurationValueChange={(value) => {
          setDurationValue(value);
        }}
        onDurationTypeChange={(value) => {
          setDurationType(value);
        }}
        onDurationBlur={() => setDurationTouched(true)}
        durationTouched={durationTouched}
        durationError={durationError}
        startDate={startDate}
        onStartDateChange={setStartDate}
        onStartDateBlur={() => setStartDateTouched(true)}
        startDateTouched={startDateTouched}
        endDate={endDate}
        onEndDateChange={setEndDate}
        onEndDateBlur={() => setEndDateTouched(true)}
        endDateTouched={endDateTouched}
      />

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
          <TabsContent key={value} value={value} className="mt-0 focus-visible:outline-none">
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
