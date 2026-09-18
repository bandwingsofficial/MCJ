"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Pencil,
  Upload,
  X,
} from "lucide-react";
import type { AxiosError } from "axios";
import Link from "next/link";

import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { Textarea } from "@/src/shared/components/ui/textarea";
import { AppSelect } from "@/src/shared/components/ui/select";
import {
  ValidatedField,
  validatedFieldInputClass,
  type FieldVisualState,
} from "@/src/shared/components/ui/validated-field";
import { getErrorMessage } from "@/src/core/utils/get-error-message";
import { cn } from "@/src/shared/lib/cn";

import { JobTagInput } from "@/src/features/jobs/components/job-tag-input";
import {
  EMPLOYMENT_TYPES,
  JOB_CATEGORIES,
  JOB_QUALIFICATIONS,
  WORK_MODES,
  WORKING_DAYS,
} from "@/src/features/jobs/constants/job.constants";
import {
  companyJobOnboardingSchema,
  type CompanyJobOnboardingValues,
} from "@/src/features/jobs/schemas/company-job-onboarding.schema";
import { jobService } from "@/src/features/jobs/services/job.service";

type StepId = 0 | 1 | 2 | 3;

const STEPS = [
  {
    id: 0 as StepId,
    label: "Company Details",
    short: "Company",
    description: "Tell us about your organization and how we can reach you.",
  },
  {
    id: 1 as StepId,
    label: "Job Details",
    short: "Job",
    description: "Describe the role, location, compensation, and openings.",
  },
  {
    id: 2 as StepId,
    label: "Requirements",
    short: "Requirements",
    description: "Set experience, qualifications, and skills for candidates.",
  },
  {
    id: 3 as StepId,
    label: "Review & Submit",
    short: "Review",
    description: "Confirm everything looks right before submitting to MCJ.",
  },
] as const;

const STEP_FIELDS: Record<
  Exclude<StepId, 3>,
  (keyof CompanyJobOnboardingValues)[]
> = {
  0: ["companyName", "companyEmail", "companyPhone", "companyWebsite"],
  1: [
    "title",
    "category",
    "employmentType",
    "workingDays",
    "workMode",
    "location",
    "department",
    "minSalary",
    "maxSalary",
    "vacancies",
    "applicationDeadline",
    "description",
    "responsibilities",
    "benefits",
  ],
  2: [
    "minExperience",
    "maxExperience",
    "qualifications",
    "skills",
    "preferredSkills",
  ],
};

function getSyncFieldState(
  touched: boolean,
  error?: string,
  value?: string,
  required = true,
): FieldVisualState {
  if (!touched) {
    return "neutral";
  }
  if (error) {
    return "invalid";
  }
  if (required) {
    return value?.trim() ? "valid" : "neutral";
  }
  return value?.trim() ? "valid" : "neutral";
}

function parseSalary(value: string): number | undefined {
  const digits = value.replace(/[^\d]/g, "");
  return digits ? Number(digits) : undefined;
}

function formatSalary(value?: number): string {
  return value == null || Number.isNaN(value)
    ? ""
    : value.toLocaleString("en-IN");
}

function tomorrowDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

function labelFor(
  options: { value: string; label: string }[],
  value?: string,
) {
  return options.find((item) => item.value === value)?.label ?? value ?? "—";
}

function ReviewBlock({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200/90 bg-[#F8FBFF]/60 p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-[#0B1F3A]">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] transition hover:text-[#1D4ED8]"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </button>
      </div>
      <div className="space-y-2 text-sm text-slate-600">{children}</div>
    </section>
  );
}

function ReviewLine({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="grid gap-0.5 sm:grid-cols-[140px_1fr] sm:gap-3">
      <span className="text-slate-400">{label}</span>
      <span className="font-medium text-[#0B1F3A]">{value || "—"}</span>
    </div>
  );
}

const GRID = "grid grid-cols-1 gap-3 md:grid-cols-2";

export function CompanyJobOnboardingPage() {
  const [step, setStep] = useState<StepId>(0);
  const [highestStep, setHighestStep] = useState<StepId>(0);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    trigger,
    watch,
    formState: { errors, touchedFields, isSubmitted },
  } = useForm<CompanyJobOnboardingValues>({
    resolver: zodResolver(companyJobOnboardingSchema) as never,
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      companyName: "",
      companyEmail: "",
      companyPhone: "",
      companyWebsite: "",
      title: "",
      category: "",
      employmentType: "FULL_TIME",
      workingDays: "MONDAY_TO_FRIDAY",
      workMode: "ONSITE",
      location: "",
      department: "",
      minExperience: 0,
      maxExperience: 0,
      minSalary: undefined as unknown as number,
      maxSalary: undefined as unknown as number,
      vacancies: 1,
      applicationDeadline: "",
      skills: [],
      preferredSkills: [],
      qualifications: [],
      description: "",
      responsibilities: "",
      benefits: "",
    },
  });

  const values = watch();

  const fieldState = (
    name: keyof CompanyJobOnboardingValues,
    required = true,
  ) => {
    const current = values[name];
    const asString = Array.isArray(current)
      ? current.join(",")
      : String(current ?? "");
    const errorMessage = errors[name]?.message;
    return getSyncFieldState(
      Boolean(touchedFields[name] || isSubmitted || errorMessage),
      errorMessage,
      asString,
      required,
    );
  };

  const inputClass = (state: FieldVisualState) =>
    validatedFieldInputClass(state, "h-11");

  const salarySummary = useMemo(() => {
    if (values.minSalary == null && values.maxSalary == null) {
      return "—";
    }
    const min = formatSalary(values.minSalary);
    const max = formatSalary(values.maxSalary);
    if (min && max && min !== max) {
      return `₹${min} – ₹${max}`;
    }
    return `₹${min || max}`;
  }, [values.minSalary, values.maxSalary]);

  const experienceSummary = useMemo(() => {
    const min = values.minExperience ?? 0;
    const max = values.maxExperience ?? 0;
    return `${min} – ${max} Years`;
  }, [values.minExperience, values.maxExperience]);

  const goToStep = (next: StepId) => {
    setStepError(null);
    setStep(next);
    setHighestStep((prev) => (next > prev ? next : prev));
  };

  const handleNext = async () => {
    setStepError(null);
    if (step === 3) {
      return;
    }

    const fields = STEP_FIELDS[step];
    const valid = await trigger(fields);
    if (!valid) {
      setStepError("Please fix the highlighted fields before continuing.");
      return;
    }

    if (logoError) {
      setStepError(logoError);
      return;
    }

    goToStep((step + 1) as StepId);
  };

  const handlePrevious = () => {
    setStepError(null);
    if (step > 0) {
      setStep((step - 1) as StepId);
    }
  };

  const submit = handleSubmit(async (formValues) => {
    if (logoError) {
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);
      await jobService.submitCompanyJob(formValues, logo);
      setSubmitted(true);
    } catch (err) {
      setFormError(
        getErrorMessage(err as AxiosError) ||
          "Unable to submit your hiring requirement. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  });

  if (submitted) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:py-16">
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_8px_28px_rgba(11,31,58,0.06)]">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#EFF6FF] via-white to-[#F5F3FF] px-6 py-10 text-center sm:px-8">
            <div className="pointer-events-none absolute -right-10 top-0 h-32 w-32 rounded-full bg-[#E0E7FF]/50 blur-3xl" />
            <CheckCircle2 className="relative mx-auto h-12 w-12 text-emerald-600" />
            <h1 className="relative mt-4 text-2xl font-bold text-[#0B1F3A]">
              Job Submission Received
            </h1>
            <p className="relative mt-3 text-sm leading-6 text-slate-500">
              Your hiring requirement has been submitted successfully. Our team
              will review the information and contact you after verification.
            </p>
            <p className="relative mt-4 text-sm font-semibold text-amber-700">
              Status: Pending Review
            </p>
            <Link
              href="/"
              className="relative mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[#0B1F3A] px-5 text-sm font-semibold text-white transition hover:bg-[#102A56]"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FBFF] pb-12">
      {/* Compact top header */}
      <header className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex w-full max-w-[1050px] flex-col gap-3 px-4 py-4 sm:px-6 sm:py-5 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#2563EB] transition hover:text-[#1D4ED8]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Careers
          </Link>

          <div className="min-w-0 text-left lg:flex-1 lg:text-center">
            <h1 className="text-lg font-bold tracking-tight text-[#0B1F3A] sm:text-xl">
              Company Job Registration
            </h1>
            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
              Create and submit a new job opening for MCJ Academy students.
            </p>
          </div>

          <p className="text-sm font-semibold text-[#1D4ED8] lg:shrink-0 lg:text-right">
            MCJ Academy Careers
          </p>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1050px] px-4 py-6 sm:px-6 lg:py-8">
        {/* Progress + horizontal wizard */}
        <div className="mb-6">
          <div className="-mx-4 mb-5 overflow-x-auto px-4 sm:mx-0 sm:overflow-visible sm:px-0">
            <ol className="flex min-w-max items-start justify-between gap-0 sm:min-w-0">
              {STEPS.map((item, index) => {
                const active = step === item.id;
                const completed = item.id < step;
                const reachable = item.id <= highestStep || item.id <= step;

                return (
                  <li
                    key={item.id}
                    className="flex flex-1 items-start last:flex-none"
                  >
                    <button
                      type="button"
                      disabled={!reachable && item.id > step}
                      onClick={() => {
                        if (item.id <= highestStep || item.id < step) {
                          goToStep(item.id);
                        }
                      }}
                      className={cn(
                        "flex w-[4.5rem] flex-col items-center gap-1.5 sm:w-auto sm:min-w-[5.5rem]",
                        reachable || item.id <= step
                          ? "cursor-pointer"
                          : "cursor-not-allowed",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition",
                          active
                            ? "bg-[#2563EB] text-white shadow-sm"
                            : completed
                              ? "bg-[#DBEAFE] text-[#1D4ED8] ring-1 ring-[#93C5FD]"
                              : "bg-slate-100 text-slate-400 ring-1 ring-slate-200",
                        )}
                      >
                        {completed && !active ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          index + 1
                        )}
                      </span>
                      <span
                        className={cn(
                          "text-center text-[10px] font-semibold sm:text-xs",
                          active || completed
                            ? "text-[#1D4ED8]"
                            : "text-slate-400",
                        )}
                      >
                        {item.short}
                      </span>
                    </button>

                    {index < STEPS.length - 1 ? (
                      <div
                        className={cn(
                          "mt-4 h-0.5 min-w-[1.25rem] flex-1 rounded-full sm:min-w-[2rem]",
                          item.id < step ? "bg-[#2563EB]" : "bg-slate-200",
                        )}
                        aria-hidden
                      />
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">
                Step {step + 1} of {STEPS.length}
              </p>
              <p className="mt-0.5 text-base font-bold text-[#0B1F3A] sm:text-lg">
                {STEPS[step].label}
              </p>
            </div>
            <p className="text-sm font-semibold text-[#2563EB]">
              {Math.round(((step + 1) / STEPS.length) * 100)}% Complete
            </p>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-slate-200/80">
            <div
              className="h-full rounded-full bg-[#2563EB] transition-all duration-500 ease-out"
              style={{
                width: `${((step + 1) / STEPS.length) * 100}%`,
              }}
            />
          </div>
        </div>

        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            if (step === 3) {
              void submit(event);
            }
          }}
        >
          <div className="rounded-[22px] border border-slate-200/90 bg-white p-5 shadow-[0_8px_28px_rgba(11,31,58,0.06)] sm:p-7 lg:p-8">
            <div className="mb-6 border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold tracking-tight text-[#0B1F3A] sm:text-xl">
                {STEPS[step].label}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {STEPS[step].description}
              </p>
            </div>

                {step === 0 ? (
                  <div className="space-y-4">
                    <div className={GRID}>
                      <ValidatedField
                        label="Company Name"
                        required
                        state={fieldState("companyName")}
                        errorMessage={errors.companyName?.message}
                      >
                        <Input
                          className={inputClass(fieldState("companyName"))}
                          placeholder="ABC Technologies"
                          disabled={isSubmitting}
                          {...register("companyName")}
                        />
                      </ValidatedField>
                      <ValidatedField
                        label="Company Website"
                        state={fieldState("companyWebsite", false)}
                        errorMessage={errors.companyWebsite?.message}
                      >
                        <Input
                          className={inputClass(
                            fieldState("companyWebsite", false),
                          )}
                          placeholder="https://company.com"
                          disabled={isSubmitting}
                          {...register("companyWebsite")}
                        />
                      </ValidatedField>
                      <ValidatedField
                        label="Company Email"
                        required
                        state={fieldState("companyEmail")}
                        errorMessage={errors.companyEmail?.message}
                      >
                        <Input
                          type="email"
                          className={inputClass(fieldState("companyEmail"))}
                          placeholder="hr@company.com"
                          disabled={isSubmitting}
                          {...register("companyEmail")}
                        />
                      </ValidatedField>
                      <ValidatedField
                        label="Company Phone"
                        state={fieldState("companyPhone", false)}
                        errorMessage={errors.companyPhone?.message}
                      >
                        <Input
                          className={inputClass(
                            fieldState("companyPhone", false),
                          )}
                          placeholder="9876543210"
                          disabled={isSubmitting}
                          {...register("companyPhone")}
                        />
                      </ValidatedField>
                    </div>

                    <div>
                      <p className="mb-2 text-sm font-medium text-[#0B1F3A]">
                        Company Logo / Job Image
                      </p>
                      <label
                        className={cn(
                          "flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed px-4 py-7 text-center transition",
                          logoError
                            ? "border-red-300 bg-red-50/30"
                            : logo
                              ? "border-emerald-400 bg-emerald-50/20"
                              : "border-[#BFDBFE] bg-[#F8FBFF]/80",
                        )}
                      >
                        {logo ? (
                          <>
                            <p className="text-sm font-semibold text-[#0B1F3A]">
                              {logo.name}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {(logo.size / 1024).toFixed(1)} KB
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="mt-3 rounded-xl"
                              onClick={(event) => {
                                event.preventDefault();
                                setLogo(null);
                                setLogoError(null);
                              }}
                            >
                              <X className="mr-1 h-4 w-4" />
                              Remove
                            </Button>
                          </>
                        ) : (
                          <>
                            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#2563EB] shadow-sm">
                              <Upload className="h-5 w-5" />
                            </span>
                            <p className="mt-3 text-sm font-semibold text-[#0B1F3A]">
                              Drag & drop or click to upload
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              PNG, JPG, JPEG, WEBP · Optional
                            </p>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="sr-only"
                          disabled={isSubmitting}
                          onChange={(event) => {
                            const file = event.target.files?.[0] ?? null;
                            event.target.value = "";
                            if (!file) {
                              return;
                            }
                            if (
                              ![
                                "image/png",
                                "image/jpeg",
                                "image/webp",
                              ].includes(file.type)
                            ) {
                              setLogoError(
                                "Please upload a PNG, JPG, or WEBP image.",
                              );
                              setLogo(null);
                              return;
                            }
                            if (file.size > 5 * 1024 * 1024) {
                              setLogoError("Image must be 5MB or smaller.");
                              setLogo(null);
                              return;
                            }
                            setLogoError(null);
                            setLogo(file);
                          }}
                        />
                      </label>
                      {logoError ? (
                        <p className="mt-1 text-sm text-red-500">{logoError}</p>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                {step === 1 ? (
                  <div className="space-y-5">
                    <div className={GRID}>
                      <ValidatedField
                        label="Job Title"
                        required
                        state={fieldState("title")}
                        errorMessage={errors.title?.message}
                      >
                        <Input
                          className={inputClass(fieldState("title"))}
                          placeholder="Software Developer"
                          disabled={isSubmitting}
                          {...register("title")}
                        />
                      </ValidatedField>
                      <ValidatedField
                        label="Category"
                        required
                        state={fieldState("category")}
                        errorMessage={errors.category?.message}
                      >
                        <Controller
                          name="category"
                          control={control}
                          render={({ field }) => (
                            <AppSelect
                              value={field.value || undefined}
                              disabled={isSubmitting}
                              onValueChange={field.onChange}
                              options={JOB_CATEGORIES.map((item) => ({
                                value: item,
                                label: item,
                              }))}
                            />
                          )}
                        />
                      </ValidatedField>
                      <ValidatedField
                        label="Job Type"
                        required
                        state={fieldState("employmentType")}
                        errorMessage={errors.employmentType?.message}
                      >
                        <Controller
                          name="employmentType"
                          control={control}
                          render={({ field }) => (
                            <AppSelect
                              value={field.value}
                              disabled={isSubmitting}
                              onValueChange={field.onChange}
                              options={EMPLOYMENT_TYPES}
                            />
                          )}
                        />
                      </ValidatedField>
                      <ValidatedField
                        label="Work Mode"
                        required
                        state={fieldState("workMode")}
                        errorMessage={errors.workMode?.message}
                      >
                        <Controller
                          name="workMode"
                          control={control}
                          render={({ field }) => (
                            <AppSelect
                              value={field.value}
                              disabled={isSubmitting}
                              onValueChange={field.onChange}
                              options={WORK_MODES}
                            />
                          )}
                        />
                      </ValidatedField>
                      <ValidatedField
                        label="Location"
                        required
                        state={fieldState("location")}
                        errorMessage={errors.location?.message}
                      >
                        <Input
                          className={inputClass(fieldState("location"))}
                          placeholder="Bengaluru"
                          disabled={isSubmitting}
                          {...register("location")}
                        />
                      </ValidatedField>
                      <ValidatedField
                        label="Working Days"
                        required
                        state={fieldState("workingDays")}
                        errorMessage={errors.workingDays?.message}
                      >
                        <Controller
                          name="workingDays"
                          control={control}
                          render={({ field }) => (
                            <AppSelect
                              value={field.value}
                              disabled={isSubmitting}
                              onValueChange={field.onChange}
                              options={WORKING_DAYS}
                            />
                          )}
                        />
                      </ValidatedField>
                      <ValidatedField
                        label="Department"
                        state={fieldState("department", false)}
                        errorMessage={errors.department?.message}
                      >
                        <Input
                          className={inputClass(
                            fieldState("department", false),
                          )}
                          placeholder="Engineering"
                          disabled={isSubmitting}
                          {...register("department")}
                        />
                      </ValidatedField>
                      <ValidatedField
                        label="Number of Openings"
                        required
                        state={fieldState("vacancies")}
                        errorMessage={errors.vacancies?.message}
                      >
                        <Controller
                          name="vacancies"
                          control={control}
                          render={({ field }) => (
                            <Input
                              type="number"
                              min={1}
                              disabled={isSubmitting}
                              className={inputClass(fieldState("vacancies"))}
                              value={String(field.value ?? 1)}
                              onBlur={field.onBlur}
                              onChange={(event) =>
                                field.onChange(
                                  Number(event.target.value || 1),
                                )
                              }
                            />
                          )}
                        />
                      </ValidatedField>
                      <ValidatedField
                        label="Minimum Salary"
                        required
                        state={fieldState("minSalary")}
                        errorMessage={errors.minSalary?.message}
                      >
                        <Controller
                          name="minSalary"
                          control={control}
                          render={({ field }) => (
                            <Input
                              inputMode="numeric"
                              className={inputClass(fieldState("minSalary"))}
                              placeholder="15,000"
                              disabled={isSubmitting}
                              value={formatSalary(field.value)}
                              onBlur={field.onBlur}
                              onChange={(event) =>
                                field.onChange(
                                  parseSalary(event.target.value),
                                )
                              }
                            />
                          )}
                        />
                      </ValidatedField>
                      <ValidatedField
                        label="Maximum Salary"
                        required
                        state={fieldState("maxSalary")}
                        errorMessage={errors.maxSalary?.message}
                      >
                        <Controller
                          name="maxSalary"
                          control={control}
                          render={({ field }) => (
                            <Input
                              inputMode="numeric"
                              className={inputClass(fieldState("maxSalary"))}
                              placeholder="40,000"
                              disabled={isSubmitting}
                              value={formatSalary(field.value)}
                              onBlur={field.onBlur}
                              onChange={(event) =>
                                field.onChange(
                                  parseSalary(event.target.value),
                                )
                              }
                            />
                          )}
                        />
                      </ValidatedField>
                      <ValidatedField
                        label="Job Expiry Date"
                        required
                        state={fieldState("applicationDeadline")}
                        errorMessage={errors.applicationDeadline?.message}
                        className="md:col-span-2"
                      >
                        <Input
                          type="date"
                          min={tomorrowDate()}
                          disabled={isSubmitting}
                          className={inputClass(
                            fieldState("applicationDeadline"),
                          )}
                          {...register("applicationDeadline")}
                        />
                      </ValidatedField>
                    </div>

                    <ValidatedField
                      label="Job Description"
                      required
                      state={fieldState("description")}
                      errorMessage={errors.description?.message}
                    >
                      <Textarea
                        rows={4}
                        disabled={isSubmitting}
                        className={validatedFieldInputClass(
                          fieldState("description"),
                        )}
                        placeholder="Describe the role, team, and impact."
                        {...register("description")}
                      />
                    </ValidatedField>

                    <ValidatedField
                      label="Responsibilities"
                      state={fieldState("responsibilities", false)}
                      errorMessage={errors.responsibilities?.message}
                    >
                      <Textarea
                        rows={3}
                        disabled={isSubmitting}
                        placeholder="One responsibility per line"
                        {...register("responsibilities")}
                      />
                    </ValidatedField>

                    <ValidatedField
                      label="Benefits / Perks"
                      state={fieldState("benefits", false)}
                      errorMessage={errors.benefits?.message}
                    >
                      <Textarea
                        rows={2}
                        disabled={isSubmitting}
                        placeholder="Health insurance, flexible hours..."
                        {...register("benefits")}
                      />
                    </ValidatedField>
                  </div>
                ) : null}

                {step === 2 ? (
                  <div className="space-y-5">
                    <div className={GRID}>
                      <ValidatedField
                        label="Minimum Experience (years)"
                        required
                        state={fieldState("minExperience")}
                        errorMessage={errors.minExperience?.message}
                      >
                        <Controller
                          name="minExperience"
                          control={control}
                          render={({ field }) => (
                            <Input
                              type="number"
                              min={0}
                              className={inputClass(
                                fieldState("minExperience"),
                              )}
                              disabled={isSubmitting}
                              value={String(field.value ?? 0)}
                              onBlur={field.onBlur}
                              onChange={(event) =>
                                field.onChange(
                                  Number(event.target.value || 0),
                                )
                              }
                            />
                          )}
                        />
                      </ValidatedField>
                      <ValidatedField
                        label="Maximum Experience (years)"
                        required
                        state={fieldState("maxExperience")}
                        errorMessage={errors.maxExperience?.message}
                      >
                        <Controller
                          name="maxExperience"
                          control={control}
                          render={({ field }) => (
                            <Input
                              type="number"
                              min={0}
                              className={inputClass(
                                fieldState("maxExperience"),
                              )}
                              disabled={isSubmitting}
                              value={String(field.value ?? 0)}
                              onBlur={field.onBlur}
                              onChange={(event) =>
                                field.onChange(
                                  Number(event.target.value || 0),
                                )
                              }
                            />
                          )}
                        />
                      </ValidatedField>
                    </div>

                    <ValidatedField
                      label="Minimum Required Qualification"
                      required
                      state={fieldState("qualifications")}
                      errorMessage={errors.qualifications?.message}
                    >
                      <Controller
                        name="qualifications"
                        control={control}
                        render={({ field }) => (
                          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                            {JOB_QUALIFICATIONS.map((item) => {
                              const checked = field.value.includes(item);
                              return (
                                <label
                                  key={item}
                                  className={cn(
                                    "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition",
                                    checked
                                      ? "border-[#2563EB] bg-[#EFF6FF] text-[#1E3A8A]"
                                      : "border-slate-200 bg-white text-[#0B1F3A]",
                                  )}
                                >
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4"
                                    checked={checked}
                                    disabled={isSubmitting}
                                    onBlur={field.onBlur}
                                    onChange={(event) =>
                                      field.onChange(
                                        event.target.checked
                                          ? [...field.value, item]
                                          : field.value.filter(
                                              (value) => value !== item,
                                            ),
                                      )
                                    }
                                  />
                                  {item}
                                </label>
                              );
                            })}
                          </div>
                        )}
                      />
                    </ValidatedField>

                    <ValidatedField
                      label="Required Skills"
                      required
                      state={fieldState("skills")}
                      errorMessage={errors.skills?.message}
                    >
                      <Controller
                        name="skills"
                        control={control}
                        render={({ field }) => (
                          <JobTagInput
                            values={field.value}
                            disabled={isSubmitting}
                            invalid={fieldState("skills") === "invalid"}
                            onBlur={field.onBlur}
                            onChange={field.onChange}
                          />
                        )}
                      />
                    </ValidatedField>

                    <ValidatedField
                      label="Preferred Skills"
                      state={fieldState("preferredSkills", false)}
                      errorMessage={errors.preferredSkills?.message}
                    >
                      <Controller
                        name="preferredSkills"
                        control={control}
                        render={({ field }) => (
                          <JobTagInput
                            values={field.value ?? []}
                            disabled={isSubmitting}
                            onBlur={field.onBlur}
                            onChange={field.onChange}
                          />
                        )}
                      />
                    </ValidatedField>
                  </div>
                ) : null}

                {step === 3 ? (
                  <div className="space-y-4">
                    <ReviewBlock title="Company Information" onEdit={() => goToStep(0)}>
                      <ReviewLine label="Company" value={values.companyName} />
                      <ReviewLine label="Email" value={values.companyEmail} />
                      <ReviewLine label="Phone" value={values.companyPhone} />
                      <ReviewLine
                        label="Website"
                        value={values.companyWebsite}
                      />
                      <ReviewLine
                        label="Logo"
                        value={logo ? logo.name : "Not uploaded"}
                      />
                    </ReviewBlock>

                    <ReviewBlock title="Job Information" onEdit={() => goToStep(1)}>
                      <ReviewLine label="Title" value={values.title} />
                      <ReviewLine label="Category" value={values.category} />
                      <ReviewLine
                        label="Employment"
                        value={labelFor(
                          EMPLOYMENT_TYPES,
                          values.employmentType,
                        )}
                      />
                      <ReviewLine
                        label="Work Mode"
                        value={labelFor(WORK_MODES, values.workMode)}
                      />
                      <ReviewLine label="Location" value={values.location} />
                      <ReviewLine
                        label="Working Days"
                        value={labelFor(WORKING_DAYS, values.workingDays)}
                      />
                      <ReviewLine
                        label="Department"
                        value={values.department}
                      />
                      <ReviewLine label="Salary" value={salarySummary} />
                      <ReviewLine
                        label="Openings"
                        value={String(values.vacancies ?? "—")}
                      />
                      <ReviewLine
                        label="Expiry"
                        value={values.applicationDeadline}
                      />
                      <ReviewLine
                        label="Description"
                        value={
                          <span className="whitespace-pre-wrap">
                            {values.description}
                          </span>
                        }
                      />
                      {values.responsibilities?.trim() ? (
                        <ReviewLine
                          label="Responsibilities"
                          value={
                            <span className="whitespace-pre-wrap">
                              {values.responsibilities}
                            </span>
                          }
                        />
                      ) : null}
                      {values.benefits?.trim() ? (
                        <ReviewLine
                          label="Benefits"
                          value={
                            <span className="whitespace-pre-wrap">
                              {values.benefits}
                            </span>
                          }
                        />
                      ) : null}
                    </ReviewBlock>

                    <ReviewBlock
                      title="Requirements"
                      onEdit={() => goToStep(2)}
                    >
                      <ReviewLine
                        label="Experience"
                        value={experienceSummary}
                      />
                      <ReviewLine
                        label="Qualifications"
                        value={values.qualifications?.join(", ")}
                      />
                      <ReviewLine
                        label="Skills"
                        value={values.skills?.join(", ")}
                      />
                      <ReviewLine
                        label="Preferred"
                        value={
                          values.preferredSkills?.length
                            ? values.preferredSkills.join(", ")
                            : "—"
                        }
                      />
                    </ReviewBlock>
                  </div>
                ) : null}

                {stepError ? (
                  <p
                    role="alert"
                    className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800"
                  >
                    {stepError}
                  </p>
                ) : null}

                {formError ? (
                  <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {formError}
                  </p>
                ) : null}

                <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 rounded-xl border-slate-200"
                    disabled={step === 0 || isSubmitting}
                    onClick={handlePrevious}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {step === 3 ? "Back / Edit" : "Previous"}
                  </Button>

                  {step < 3 ? (
                    <Button
                      type="button"
                      className="h-11 rounded-xl bg-[#0B1F3A] text-white hover:bg-[#102A56]"
                      disabled={isSubmitting}
                      onClick={() => {
                        void handleNext();
                      }}
                    >
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      className="h-11 rounded-xl bg-[#0B1F3A] text-white hover:bg-[#102A56]"
                      disabled={isSubmitting}
                      loading={isSubmitting}
                    >
                      {isSubmitting
                        ? "Submitting..."
                        : "Submit Job Opening"}
                    </Button>
                  )}
                </div>
          </div>
        </form>
      </div>
    </div>
  );
}
