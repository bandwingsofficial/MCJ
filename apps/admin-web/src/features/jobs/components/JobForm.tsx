"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Briefcase,
  Building2,
  Calendar,
  Folder,
  Hash,
  IndianRupee,
  Mail,
  MapPin,
  Phone,
  User,
  type LucideIcon,
} from "lucide-react";

import { Label } from "@/src/shared/components/ui/label";
import { Input } from "@/src/shared/components/ui/input";
import { Textarea } from "@/src/shared/components/ui/textarea";
import { AppSelect } from "@/src/shared/components/ui/select";
import { ImageUploadField } from "@/src/shared/components/ui/image-upload-field";
import {
  ValidatedField,
  validatedFieldInputClass,
} from "@/src/shared/components/ui/validated-field";
import { cn } from "@/src/shared/lib/cn";

import { JobTagInput } from "@/src/features/jobs/components/JobTagInput";
import {
  EMPLOYMENT_TYPES,
  JOB_CATEGORIES,
  JOB_QUALIFICATIONS,
  WORK_MODES,
  WORKING_DAYS,
} from "@/src/features/jobs/constants/job.constants";
import {
  companyOnboardingSchema,
  createJobSchema,
  updateJobSchema,
  type CreateJobFormValues,
} from "@/src/features/jobs/schemas/job.schema";
import type { CreateJobRequest, Job } from "@/src/features/jobs/types/job.types";
import {
  createDefaultJobFormValues,
  formatSalaryInput,
  formValuesToCreateRequest,
  getSyncFieldState,
  jobToFormValues,
  parseSalaryInput,
  tomorrowDateInputValue,
  validateJobImageFile,
} from "@/src/features/jobs/utils/job-form.utils";

interface JobFormProps {
  formId?: string;
  initialData?: Job;
  isSubmitting: boolean;
  companyNameDefault?: string;
  variant?: "admin" | "company";
  onSubmit: (
    values: CreateJobRequest,
    image: File | null,
    removeImage: boolean,
  ) => Promise<void>;
}

const GRID_CLASS =
  "grid w-full min-w-0 grid-cols-1 gap-x-4 gap-y-3 md:grid-cols-2";

function fieldLeftIcon(Icon: LucideIcon) {
  return <Icon className="h-4 w-4" aria-hidden />;
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h3 className="border-b border-[#E8F1FF] pb-1.5 text-xs font-semibold uppercase tracking-wide text-[#2563EB]">
      {children}
    </h3>
  );
}

function inputClass(
  state: ReturnType<typeof getSyncFieldState>,
  extra = "",
  options?: Parameters<typeof validatedFieldInputClass>[2],
) {
  return validatedFieldInputClass(
    state,
    cn("h-[46px] w-full min-w-0 max-w-full", extra),
    options,
  );
}

export function JobForm({
  formId = "job-form",
  initialData,
  isSubmitting,
  companyNameDefault,
  variant = "admin",
  onSubmit,
}: JobFormProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageTouched, setImageTouched] = useState(false);

  const defaults = createDefaultJobFormValues();
  if (companyNameDefault !== undefined || variant === "company") {
    defaults.companyName = companyNameDefault ?? "";
  }

  const schema =
    variant === "company"
      ? companyOnboardingSchema
      : initialData
        ? updateJobSchema
        : createJobSchema;

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, touchedFields, isSubmitted },
  } = useForm<CreateJobFormValues>({
    resolver: zodResolver(schema) as never,
    mode: variant === "company" ? "onChange" : "onBlur",
    reValidateMode: "onChange",
    defaultValues: initialData ? jobToFormValues(initialData) : defaults,
  });

  useEffect(() => {
    const next = initialData
      ? jobToFormValues(initialData)
      : createDefaultJobFormValues();
    if (!initialData && (companyNameDefault !== undefined || variant === "company")) {
      next.companyName = companyNameDefault ?? "";
    }
    reset(next);
    setSelectedImage(null);
    setRemoveImage(false);
    setImageError(null);
    setImageTouched(false);
  }, [companyNameDefault, initialData, reset, variant]);

  const values = watch();
  const showValidation = isSubmitted;

  const fieldState = (
    name: keyof CreateJobFormValues,
    required = true,
  ) => {
    const current = values[name];
    const asString = Array.isArray(current)
      ? current.join(",")
      : typeof current === "number"
        ? String(current ?? "")
        : String(current ?? "");

    return getSyncFieldState(
      Boolean(touchedFields[name] || showValidation),
      errors[name]?.message,
      asString,
      { required },
    );
  };

  const imagePreviewUrl = removeImage
    ? null
    : selectedImage
      ? null
      : initialData?.companyLogo ?? null;
  const imageState = imageError
    ? "invalid"
    : selectedImage || (imagePreviewUrl && imageTouched)
      ? "valid"
      : "neutral";

  const submit = handleSubmit(async (formValues) => {
    if (imageError) {
      setImageTouched(true);
      return;
    }

    await onSubmit(
      formValuesToCreateRequest(formValues, { removeLogo: removeImage }),
      selectedImage,
      removeImage,
    );
  });

  const categoryOptions = JOB_CATEGORIES.map((item) => ({
    value: item,
    label: item,
  }));

  return (
    <form
      id={formId}
      className="space-y-4"
      noValidate
      onSubmit={(event) => {
        void submit(event);
      }}
    >
      <SectionTitle>Company Information</SectionTitle>
      <div className={GRID_CLASS}>
        <ValidatedField
          label="Company Name"
          required
          leftIcon={fieldLeftIcon(Building2)}
          state={fieldState("companyName")}
          errorMessage={errors.companyName?.message}
        >
          <Input
            placeholder="ABC Technologies"
            disabled={isSubmitting}
            className={inputClass(fieldState("companyName"), "", {
              leftIcon: true,
            })}
            {...register("companyName")}
          />
        </ValidatedField>

        <ValidatedField
          label="Company Website"
          state={fieldState("companyWebsite", false)}
          errorMessage={errors.companyWebsite?.message}
        >
          <Input
            placeholder="https://company.com"
            disabled={isSubmitting}
            className={inputClass(fieldState("companyWebsite", false))}
            {...register("companyWebsite")}
          />
        </ValidatedField>

        <ValidatedField
          label="Company Email"
          required
          leftIcon={fieldLeftIcon(Mail)}
          state={fieldState("companyEmail")}
          errorMessage={errors.companyEmail?.message}
        >
          <Input
            type="email"
            placeholder="hr@company.com"
            disabled={isSubmitting}
            className={inputClass(fieldState("companyEmail"), "", {
              leftIcon: true,
            })}
            {...register("companyEmail")}
          />
        </ValidatedField>

        <ValidatedField
          label="Company Phone"
          required={variant === "company"}
          leftIcon={fieldLeftIcon(Phone)}
          state={fieldState("companyPhone", variant === "company")}
          errorMessage={errors.companyPhone?.message}
        >
          <Input
            placeholder="9876543210"
            disabled={isSubmitting}
            className={inputClass(
              fieldState("companyPhone", variant === "company"),
              "",
              { leftIcon: true },
            )}
            {...register("companyPhone")}
          />
        </ValidatedField>
      </div>

      <SectionTitle>
        {variant === "company" ? "Job Details" : "Job Information"}
      </SectionTitle>
      <div className={GRID_CLASS}>
        <ValidatedField
          label="Job Title"
          required
          leftIcon={fieldLeftIcon(Briefcase)}
          state={fieldState("title")}
          errorMessage={errors.title?.message}
        >
          <Input
            placeholder="Software Developer"
            disabled={isSubmitting}
            className={inputClass(fieldState("title"), "", { leftIcon: true })}
            {...register("title")}
          />
        </ValidatedField>

        <ValidatedField
          label="Job Number"
          state="neutral"
          leftIcon={fieldLeftIcon(Hash)}
        >
          <Input
            value={
              initialData?.jobNumber ??
              (variant === "company"
                ? "Assigned after admin approval"
                : "Auto generated after save")
            }
            readOnly
            disabled
            className={inputClass("neutral", "", { leftIcon: true })}
            aria-label="Job number"
          />
        </ValidatedField>

        <ValidatedField
          label={variant === "company" ? "Job Category" : "Category"}
          required
          select
          leftIcon={fieldLeftIcon(Folder)}
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
                placeholder="Select category"
                triggerClassName={inputClass(fieldState("category"), "", {
                  leftIcon: true,
                  select: true,
                })}
                onValueChange={field.onChange}
                options={categoryOptions}
              />
            )}
          />
        </ValidatedField>

        <ValidatedField
          label="Job Type"
          required
          select
          state={fieldState("employmentType")}
          errorMessage={errors.employmentType?.message}
        >
          <Controller
            name="employmentType"
            control={control}
            render={({ field }) => (
              <AppSelect
                value={field.value ?? ""}
                disabled={isSubmitting}
                placeholder="Select job type"
                triggerClassName={inputClass(fieldState("employmentType"), "", {
                  select: true,
                })}
                onValueChange={field.onChange}
                options={EMPLOYMENT_TYPES}
              />
            )}
          />
        </ValidatedField>

        <ValidatedField
          label="Work Mode"
          required
          select
          state={fieldState("workMode")}
          errorMessage={errors.workMode?.message}
        >
          <Controller
            name="workMode"
            control={control}
            render={({ field }) => (
              <AppSelect
                value={field.value ?? ""}
                disabled={isSubmitting}
                placeholder="Select work mode"
                triggerClassName={inputClass(fieldState("workMode"), "", {
                  select: true,
                })}
                onValueChange={field.onChange}
                options={WORK_MODES}
              />
            )}
          />
        </ValidatedField>

        <ValidatedField
          label="Working Days"
          required
          select
          state={fieldState("workingDays")}
          errorMessage={errors.workingDays?.message}
        >
          <Controller
            name="workingDays"
            control={control}
            render={({ field }) => (
              <AppSelect
                value={field.value ?? ""}
                disabled={isSubmitting}
                placeholder="Select working days"
                triggerClassName={inputClass(fieldState("workingDays"), "", {
                  select: true,
                })}
                onValueChange={field.onChange}
                options={WORKING_DAYS}
              />
            )}
          />
        </ValidatedField>

        <ValidatedField
          label={variant === "company" ? "Work Location" : "Location"}
          required
          leftIcon={fieldLeftIcon(MapPin)}
          state={fieldState("location")}
          errorMessage={errors.location?.message}
        >
          <Input
            placeholder="Bengaluru"
            disabled={isSubmitting}
            className={inputClass(fieldState("location"), "", {
              leftIcon: true,
            })}
            {...register("location")}
          />
        </ValidatedField>

        <ValidatedField
          label="Department"
          state={fieldState("department", false)}
          errorMessage={errors.department?.message}
        >
          <Input
            placeholder="Engineering"
            disabled={isSubmitting}
            className={inputClass(fieldState("department", false))}
            {...register("department")}
          />
        </ValidatedField>
      </div>

      <SectionTitle>Compensation</SectionTitle>
      <div className={GRID_CLASS}>
        <ValidatedField
          label="Minimum Salary"
          required
          leftIcon={fieldLeftIcon(IndianRupee)}
          state={fieldState("minSalary")}
          errorMessage={errors.minSalary?.message}
        >
          <Controller
            name="minSalary"
            control={control}
            render={({ field }) => (
              <Input
                inputMode="numeric"
                placeholder="15,000"
                disabled={isSubmitting}
                className={inputClass(fieldState("minSalary"), "", {
                  leftIcon: true,
                })}
                value={formatSalaryInput(field.value) || ""}
                onBlur={field.onBlur}
                onChange={(event) => {
                  field.onChange(parseSalaryInput(event.target.value));
                }}
              />
            )}
          />
        </ValidatedField>

        <ValidatedField
          label="Maximum Salary"
          required
          leftIcon={fieldLeftIcon(IndianRupee)}
          state={fieldState("maxSalary")}
          errorMessage={errors.maxSalary?.message}
        >
          <Controller
            name="maxSalary"
            control={control}
            render={({ field }) => (
              <Input
                inputMode="numeric"
                placeholder="40,000"
                disabled={isSubmitting}
                className={inputClass(fieldState("maxSalary"), "", {
                  leftIcon: true,
                })}
                value={formatSalaryInput(field.value) || ""}
                onBlur={field.onBlur}
                onChange={(event) => {
                  field.onChange(parseSalaryInput(event.target.value));
                }}
              />
            )}
          />
        </ValidatedField>

        <ValidatedField label="Salary Period" state="neutral">
          <Input
            value="Monthly (INR)"
            readOnly
            disabled
            className="h-[46px]"
            aria-label="Salary period"
          />
        </ValidatedField>
      </div>

      <SectionTitle>
        {variant === "company" ? "Requirements" : "Qualification & Experience"}
      </SectionTitle>
      <div className={GRID_CLASS}>
        <ValidatedField
          label="Minimum Experience (years)"
          required
          leftIcon={fieldLeftIcon(User)}
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
                placeholder="0"
                disabled={isSubmitting}
                className={inputClass(fieldState("minExperience"), "", {
                  leftIcon: true,
                })}
                value={Number.isFinite(field.value) ? String(field.value) : "0"}
                onBlur={field.onBlur}
                onChange={(event) => {
                  field.onChange(
                    event.target.value === "" ? 0 : Number(event.target.value),
                  );
                }}
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
                disabled={isSubmitting}
                className={inputClass(fieldState("maxExperience"))}
                value={Number.isFinite(field.value) ? String(field.value) : "0"}
                onBlur={field.onBlur}
                onChange={(event) => {
                  field.onChange(
                    event.target.value === "" ? 0 : Number(event.target.value),
                  );
                }}
              />
            )}
          />
        </ValidatedField>
      </div>

      <div className="min-w-0">
        <Label required>Minimum Required Qualification</Label>
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
                      className="h-4 w-4 shrink-0"
                      checked={checked}
                      disabled={isSubmitting}
                      onBlur={field.onBlur}
                      onChange={(event) => {
                        field.onChange(
                          event.target.checked
                            ? [...field.value, item]
                            : field.value.filter((value) => value !== item),
                        );
                      }}
                    />
                    <span className="min-w-0 flex-1 text-left">{item}</span>
                  </label>
                );
              })}
            </div>
          )}
        />
        <div className="mt-1 min-h-[1.25rem]">
          {errors.qualifications?.message ? (
            <p role="alert" className="text-sm text-red-500">
              {errors.qualifications.message}
            </p>
          ) : null}
        </div>
      </div>

      <SectionTitle>Skills</SectionTitle>
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
              state={fieldState("skills")}
              placeholder="React, Node.js, PostgreSQL"
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
              state={fieldState("preferredSkills", false)}
              placeholder="AWS, Docker"
              onBlur={field.onBlur}
              onChange={field.onChange}
            />
          )}
        />
      </ValidatedField>

      <SectionTitle>Description</SectionTitle>
      <ValidatedField
        label="Job Description"
        required
        state={fieldState("description")}
        errorMessage={errors.description?.message}
      >
        <Textarea
          rows={4}
          placeholder="Describe the role, team, and impact."
          disabled={isSubmitting}
          className={inputClass(fieldState("description"), "min-h-[96px]")}
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
          placeholder="One responsibility per line"
          disabled={isSubmitting}
          className={inputClass(
            fieldState("responsibilities", false),
            "min-h-[80px]",
          )}
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
          placeholder="Health insurance, flexible hours..."
          disabled={isSubmitting}
          className={inputClass(fieldState("benefits", false), "min-h-[72px]")}
          {...register("benefits")}
        />
      </ValidatedField>

      <SectionTitle>
        {variant === "company" ? "Application Details" : "Recruitment"}
      </SectionTitle>
      <div className={GRID_CLASS}>
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
                value={Number.isFinite(field.value) ? String(field.value) : "1"}
                onBlur={field.onBlur}
                onChange={(event) => {
                  field.onChange(
                    event.target.value === "" ? 1 : Number(event.target.value),
                  );
                }}
              />
            )}
          />
        </ValidatedField>

        <ValidatedField
          label="Job Expiry Date"
          required
          leftIcon={fieldLeftIcon(Calendar)}
          state={fieldState("applicationDeadline")}
          errorMessage={errors.applicationDeadline?.message}
        >
          <Input
            type="date"
            min={initialData ? undefined : tomorrowDateInputValue()}
            disabled={isSubmitting}
            className={inputClass(fieldState("applicationDeadline"), "", {
              leftIcon: true,
            })}
            {...register("applicationDeadline")}
          />
        </ValidatedField>
      </div>

      <ValidatedField
        label="Interview Process"
        state={fieldState("interviewNotes", false)}
        errorMessage={errors.interviewNotes?.message}
      >
        <Textarea
          rows={2}
          placeholder="Phone screen, technical round, HR discussion"
          disabled={isSubmitting}
          className={inputClass(
            fieldState("interviewNotes", false),
            "min-h-[72px]",
          )}
          {...register("interviewNotes")}
        />
      </ValidatedField>

      <SectionTitle>
        {variant === "company" ? "Company Logo" : "Media"}
      </SectionTitle>
      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">
          Company Logo / Job Image
        </p>
        <ImageUploadField
          compact
          entityLabel="job"
          previewUrl={imagePreviewUrl}
          file={selectedImage}
          disabled={isSubmitting}
          error={imageError}
          state={imageState}
          hint="PNG, JPG, JPEG, WEBP"
          onFileSelect={(file) => {
            setImageTouched(true);
            const message = file ? validateJobImageFile(file) : null;
            setImageError(message);
            if (message) {
              setSelectedImage(null);
              return;
            }
            setSelectedImage(file);
            setRemoveImage(false);
          }}
          onRemove={() => {
            setImageTouched(true);
            setSelectedImage(null);
            setRemoveImage(true);
            setImageError(null);
          }}
          validateFile={validateJobImageFile}
        />
      </div>
    </form>
  );
}
