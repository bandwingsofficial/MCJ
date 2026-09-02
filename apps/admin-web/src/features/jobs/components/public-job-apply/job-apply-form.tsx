"use client";

import { useMemo } from "react";
import { Controller, type Control, type FieldErrors, type UseFormRegister, type UseFormWatch } from "react-hook-form";
import {
  Briefcase,
  Building2,
  Calendar,
  IndianRupee,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Checkbox } from "@/src/shared/components/ui/checkbox";
import { Input } from "@/src/shared/components/ui/input";
import { AppSelect } from "@/src/shared/components/ui/select";
import {
  ValidatedField,
  validatedFieldInputClass,
  type FieldVisualState,
} from "@/src/shared/components/ui/validated-field";

import { JobTagInput } from "@/src/features/jobs/components/JobTagInput";
import { ResumeUploadField } from "@/src/features/jobs/components/ResumeUploadField";
import { FormSection } from "@/src/features/jobs/components/public-job-apply/form-section";
import { JOB_QUALIFICATIONS } from "@/src/features/jobs/constants/job.constants";
import type { PublicJobApplicationFormValues } from "@/src/features/jobs/schemas/public-job-application.schema";
import {
  formatSalaryInput,
  getSyncFieldState,
  parseSalaryInput,
} from "@/src/features/jobs/utils/job-form.utils";

const GRID = "grid grid-cols-1 gap-x-4 gap-y-3 md:grid-cols-2";

interface JobApplyFormProps {
  register: UseFormRegister<PublicJobApplicationFormValues>;
  control: Control<PublicJobApplicationFormValues>;
  errors: FieldErrors<PublicJobApplicationFormValues>;
  watch: UseFormWatch<PublicJobApplicationFormValues>;
  showValidation: boolean;
  touchedFieldNames: Partial<
    Record<keyof PublicJobApplicationFormValues, boolean | undefined>
  >;
  isSubmitting: boolean;
  formError: string | null;
  resume: File | null;
  visibleResumeError: string | null;
  declarationAccepted: boolean;
  declarationTouched: boolean;
  declarationError: string | null;
  onDeclarationChange: (accepted: boolean) => void;
  onResumeSelect: (file: File | null) => void;
  onSubmit: () => void;
}

function fieldState(
  name: keyof PublicJobApplicationFormValues,
  values: PublicJobApplicationFormValues,
  touchedFieldNames: Partial<
    Record<keyof PublicJobApplicationFormValues, boolean | undefined>
  >,
  errors: FieldErrors<PublicJobApplicationFormValues>,
  showValidation: boolean,
  required = true,
): FieldVisualState {
  const current = values[name];
  const asString = Array.isArray(current)
    ? current.join(",")
    : typeof current === "number"
      ? String(current ?? "")
      : String(current ?? "");

  return getSyncFieldState(
    Boolean(touchedFieldNames[name] || showValidation),
    errors[name]?.message,
    asString,
    { required },
  );
}

export function JobApplyForm({
  register,
  control,
  errors,
  watch,
  touchedFieldNames,
  showValidation,
  isSubmitting,
  formError,
  resume,
  visibleResumeError,
  declarationAccepted,
  declarationTouched,
  declarationError,
  onDeclarationChange,
  onResumeSelect,
  onSubmit,
}: JobApplyFormProps) {
  const values = watch();

  const state = (
    name: keyof PublicJobApplicationFormValues,
    required = true,
  ) => fieldState(name, values, touchedFieldNames, errors, showValidation, required);

  const inputClass = (
    name: keyof PublicJobApplicationFormValues,
    extra = "",
    required = true,
  ) =>
    validatedFieldInputClass(state(name, required), `h-[46px] w-full ${extra}`);

  const showDeclarationError = useMemo(
    () =>
      Boolean(
        declarationError &&
          !declarationAccepted &&
          (showValidation || declarationTouched),
      ),
    [
      declarationError,
      declarationAccepted,
      declarationTouched,
      showValidation,
    ],
  );

  return (
    <section className="rounded-2xl border border-[#DCE8F5] bg-white p-5 shadow-[0_8px_24px_rgba(16,42,86,0.06)] sm:p-6">
      <header>
        <h2 className="text-xl font-semibold text-[#102A56]">
          Application Form
        </h2>
        <p className="mt-1 text-sm text-[#647A9B]">
          Complete all required sections. Fields marked with{" "}
          <span className="text-red-500">*</span> are mandatory.
        </p>
      </header>

      <form
        className="mt-6 space-y-7"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <FormSection
          title="Personal Information"
          description="Your contact details for this application."
        >
          <div className={GRID}>
            <ValidatedField
              label="Full Name"
              required
              state={state("applicantName")}
              errorMessage={errors.applicantName?.message}
            >
              <User className="pointer-events-none absolute left-3 top-1/2 z-[1] h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="applicant-name"
                autoComplete="name"
                disabled={isSubmitting}
                placeholder="Enter your full name"
                className={inputClass("applicantName", "pl-10")}
                {...register("applicantName")}
              />
            </ValidatedField>

            <ValidatedField
              label="Email"
              required
              state={state("applicantEmail")}
              errorMessage={errors.applicantEmail?.message}
            >
              <Mail className="pointer-events-none absolute left-3 top-1/2 z-[1] h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="applicant-email"
                type="email"
                autoComplete="email"
                disabled={isSubmitting}
                placeholder="Enter your email address"
                className={inputClass("applicantEmail", "pl-10")}
                {...register("applicantEmail")}
              />
            </ValidatedField>

            <ValidatedField
              label="Phone Number"
              required
              state={state("applicantPhone")}
              errorMessage={errors.applicantPhone?.message}
            >
              <Phone className="pointer-events-none absolute left-3 top-1/2 z-[1] h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="applicant-phone"
                inputMode="numeric"
                autoComplete="tel"
                disabled={isSubmitting}
                placeholder="Enter your phone number"
                className={inputClass("applicantPhone", "pl-10")}
                {...register("applicantPhone")}
              />
            </ValidatedField>

            <ValidatedField
              label="Current Location"
              required
              state={state("currentLocation")}
              errorMessage={errors.currentLocation?.message}
            >
              <MapPin className="pointer-events-none absolute left-3 top-1/2 z-[1] h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="applicant-location"
                disabled={isSubmitting}
                placeholder="City, State"
                className={inputClass("currentLocation", "pl-10")}
                {...register("currentLocation")}
              />
            </ValidatedField>
          </div>
        </FormSection>

        <FormSection
          title="Education"
          description="Your highest level of education and area of study."
        >
          <div className={GRID}>
            <ValidatedField
              label="Highest Qualification"
              required
              state={state("highestQualification")}
              errorMessage={errors.highestQualification?.message}
            >
              <Controller
                name="highestQualification"
                control={control}
                render={({ field }) => (
                  <AppSelect
                    value={field.value || undefined}
                    disabled={isSubmitting}
                    placeholder="Select highest qualification"
                    triggerClassName={inputClass("highestQualification")}
                    onValueChange={field.onChange}
                    options={JOB_QUALIFICATIONS.map((item) => ({
                      value: item,
                      label: item,
                    }))}
                  />
                )}
              />
            </ValidatedField>

            <ValidatedField
              label="Specialization / Course"
              state={state("course", false)}
              errorMessage={errors.course?.message}
            >
              <Input
                disabled={isSubmitting}
                placeholder="Enter specialization or course"
                className={inputClass("course", "", false)}
                {...register("course")}
              />
            </ValidatedField>
          </div>
        </FormSection>

        <FormSection
          title="Experience"
          description="Your professional background and availability."
        >
          <div className={GRID}>
            <ValidatedField
              label="Total Experience (years)"
              required
              state={state("yearsOfExperience")}
              errorMessage={errors.yearsOfExperience?.message}
            >
              <Briefcase className="pointer-events-none absolute left-3 top-1/2 z-[1] h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Controller
                name="yearsOfExperience"
                control={control}
                render={({ field }) => (
                  <Input
                    id="applicant-experience"
                    type="number"
                    min={0}
                    disabled={isSubmitting}
                    placeholder="e.g. 2"
                    className={inputClass("yearsOfExperience", "pl-10")}
                    value={
                      Number.isFinite(field.value) ? String(field.value) : ""
                    }
                    onBlur={field.onBlur}
                    onChange={(event) => {
                      const next = event.target.value;
                      field.onChange(next === "" ? undefined : Number(next));
                    }}
                  />
                )}
              />
            </ValidatedField>

            <ValidatedField
              label="Current / Previous Company"
              state={state("currentCompany", false)}
              errorMessage={errors.currentCompany?.message}
            >
              <Building2 className="pointer-events-none absolute left-3 top-1/2 z-[1] h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                disabled={isSubmitting}
                placeholder="Enter company name"
                className={inputClass("currentCompany", "pl-10", false)}
                {...register("currentCompany")}
              />
            </ValidatedField>

            <ValidatedField
              label="Notice Period"
              state={state("noticePeriod", false)}
              errorMessage={errors.noticePeriod?.message}
            >
              <Calendar className="pointer-events-none absolute left-3 top-1/2 z-[1] h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                disabled={isSubmitting}
                placeholder="Immediate / 30 days"
                className={inputClass("noticePeriod", "pl-10", false)}
                {...register("noticePeriod")}
              />
            </ValidatedField>

            <ValidatedField
              label="Expected Salary"
              state={state("expectedSalary", false)}
              errorMessage={errors.expectedSalary?.message}
            >
              <IndianRupee className="pointer-events-none absolute left-3 top-1/2 z-[1] h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Controller
                name="expectedSalary"
                control={control}
                render={({ field }) => (
                  <Input
                    inputMode="numeric"
                    disabled={isSubmitting}
                    placeholder="Enter expected salary"
                    className={inputClass("expectedSalary", "pl-10", false)}
                    value={formatSalaryInput(field.value) || ""}
                    onBlur={field.onBlur}
                    onChange={(event) => {
                      field.onChange(parseSalaryInput(event.target.value));
                    }}
                  />
                )}
              />
            </ValidatedField>
          </div>

          <ValidatedField
            label="Skills"
            required
            state={state("skills")}
            errorMessage={errors.skills?.message}
          >
            <Controller
              name="skills"
              control={control}
              render={({ field }) => (
                <JobTagInput
                  values={field.value}
                  disabled={isSubmitting}
                  state={state("skills")}
                  placeholder="Type a skill and press Enter"
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                />
              )}
            />
          </ValidatedField>
        </FormSection>

        <FormSection
          title="Resume / Documents"
          description="Upload your latest resume in PDF or Word format."
        >
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">
              Upload Resume <span className="text-red-500">*</span>
            </p>
            <ResumeUploadField
              file={resume}
              error={visibleResumeError}
              disabled={isSubmitting}
              onFileSelect={onResumeSelect}
            />
          </div>
        </FormSection>

        <FormSection title="Application Declaration">
          <div
            className={`rounded-xl border px-4 py-3 ${
              showDeclarationError
                ? "border-red-200 bg-red-50/40"
                : "border-[#E8F1FF] bg-[#F8FBFF]"
            }`}
          >
            <label className="flex cursor-pointer items-start gap-3">
              <Checkbox
                checked={declarationAccepted}
                disabled={isSubmitting}
                onCheckedChange={(checked) => onDeclarationChange(Boolean(checked))}
              />
              <span className="text-sm leading-relaxed text-[#102A56]">
                I confirm that the information provided is accurate and
                complete. I understand that MCJ Institute may use these details
                to evaluate my application for this position.
              </span>
            </label>
            {showDeclarationError ? (
              <p role="alert" className="mt-2 text-sm text-red-500">
                {declarationError}
              </p>
            ) : null}
          </div>
        </FormSection>

        {formError ? (
          <p
            role="alert"
            className="rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-700"
          >
            {formError}
          </p>
        ) : null}

        <div className="border-t border-[#E8F1FF] pt-5">
          <Button
            type="submit"
            className="h-12 w-full sm:w-auto sm:min-w-[220px]"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </Button>
        </div>
      </form>
    </section>
  );
}
