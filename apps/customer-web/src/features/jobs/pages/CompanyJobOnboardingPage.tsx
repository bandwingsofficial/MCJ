"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Upload, X } from "lucide-react";
import type { AxiosError } from "axios";

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

const GRID = "grid grid-cols-1 gap-3 md:grid-cols-2";

export function CompanyJobOnboardingPage() {
  const [logo, setLogo] = useState<File | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    control,
    handleSubmit,
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
  const showValidation = isSubmitted;

  const fieldState = (
    name: keyof CompanyJobOnboardingValues,
    required = true,
  ) => {
    const current = values[name];
    const asString = Array.isArray(current)
      ? current.join(",")
      : String(current ?? "");
    return getSyncFieldState(
      Boolean(touchedFields[name] || showValidation),
      errors[name]?.message,
      asString,
      required,
    );
  };

  const inputClass = (state: FieldVisualState) =>
    validatedFieldInputClass(state, "h-11");

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
      <div className="mx-auto w-full max-w-3xl px-4 py-12">
        <div className="rounded-2xl border border-[#DCE8F5] bg-white px-6 py-10 text-center shadow-[0_8px_24px_rgba(16,42,86,0.06)]">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
          <h1 className="mt-4 text-2xl font-bold text-[#102A56]">
            Job Submission Received
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#647A9B]">
            Your hiring requirement has been submitted successfully. Our team
            will review the information and contact you after verification.
          </p>
          <p className="mt-4 text-sm font-semibold text-amber-700">
            Status: Pending Review
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-10">
      <section className="mb-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2563EB]">
          Company Job Onboarding
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#102A56]">
          Submit Your Hiring Requirement
        </h1>
        <p className="mt-2 text-sm text-[#647A9B]">
          Share the complete job details. MCJ will review and publish approved
          openings to students.
        </p>
      </section>

      <form
        className="space-y-5 rounded-2xl border border-[#DCE8F5] bg-white p-5 shadow-[0_8px_24px_rgba(16,42,86,0.06)] sm:p-6"
        noValidate
        onSubmit={(event) => {
          void submit(event);
        }}
      >
        <h2 className="border-b border-[#E8F1FF] pb-1.5 text-xs font-semibold uppercase tracking-wide text-[#2563EB]">
          Company Information
        </h2>
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
              className={inputClass(fieldState("companyWebsite", false))}
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
              className={inputClass(fieldState("companyPhone", false))}
              placeholder="9876543210"
              disabled={isSubmitting}
              {...register("companyPhone")}
            />
          </ValidatedField>
        </div>

        <h2 className="border-b border-[#E8F1FF] pb-1.5 text-xs font-semibold uppercase tracking-wide text-[#2563EB]">
          Job Information
        </h2>
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
        </div>

        <h2 className="border-b border-[#E8F1FF] pb-1.5 text-xs font-semibold uppercase tracking-wide text-[#2563EB]">
          Compensation
        </h2>
        <div className={GRID}>
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
                    field.onChange(parseSalary(event.target.value))
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
                    field.onChange(parseSalary(event.target.value))
                  }
                />
              )}
            />
          </ValidatedField>
        </div>

        <h2 className="border-b border-[#E8F1FF] pb-1.5 text-xs font-semibold uppercase tracking-wide text-[#2563EB]">
          Qualification & Experience
        </h2>
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
                  className={inputClass(fieldState("minExperience"))}
                  disabled={isSubmitting}
                  value={String(field.value ?? 0)}
                  onBlur={field.onBlur}
                  onChange={(event) =>
                    field.onChange(Number(event.target.value || 0))
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
                  className={inputClass(fieldState("maxExperience"))}
                  disabled={isSubmitting}
                  value={String(field.value ?? 0)}
                  onBlur={field.onBlur}
                  onChange={(event) =>
                    field.onChange(Number(event.target.value || 0))
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
                        "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm",
                        checked
                          ? "border-[#2563EB] bg-[#E8F1FF] text-[#1E3A8A]"
                          : "border-[#DCE8F5] bg-white text-[#102A56]",
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
                              : field.value.filter((value) => value !== item),
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

        <ValidatedField
          label="Job Description"
          required
          state={fieldState("description")}
          errorMessage={errors.description?.message}
        >
          <Textarea
            rows={4}
            disabled={isSubmitting}
            className={validatedFieldInputClass(fieldState("description"))}
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

        <div className={GRID}>
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
                    field.onChange(Number(event.target.value || 1))
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
          >
            <Input
              type="date"
              min={tomorrowDate()}
              disabled={isSubmitting}
              className={inputClass(fieldState("applicationDeadline"))}
              {...register("applicationDeadline")}
            />
          </ValidatedField>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-[#102A56]">
            Company Logo / Job Image
          </p>
          <label
            className={cn(
              "flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed px-4 py-6 text-center",
              logoError
                ? "border-red-300 bg-red-50/30"
                : logo
                  ? "border-emerald-400 bg-emerald-50/20"
                  : "border-slate-300 bg-slate-50/50",
            )}
          >
            {logo ? (
              <>
                <p className="text-sm font-medium text-[#102A56]">{logo.name}</p>
                <p className="mt-1 text-xs text-[#647A9B]">
                  {(logo.size / 1024).toFixed(1)} KB
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3"
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
                <Upload className="h-7 w-7 text-slate-400" />
                <p className="mt-2 text-sm font-medium text-[#102A56]">
                  Drag & drop or click to upload
                </p>
                <p className="mt-1 text-xs text-slate-400">PNG, JPG, JPEG, WEBP</p>
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
                  !["image/png", "image/jpeg", "image/webp"].includes(file.type)
                ) {
                  setLogoError("Please upload a PNG, JPG, or WEBP image.");
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

        {formError ? (
          <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
            {formError}
          </p>
        ) : null}

        <Button
          type="submit"
          className="h-12 w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Job"}
        </Button>
      </form>
    </div>
  );
}
