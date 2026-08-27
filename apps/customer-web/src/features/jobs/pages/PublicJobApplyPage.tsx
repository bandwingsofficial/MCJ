"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Briefcase, CheckCircle2, Mail, MapPin, Phone, User } from "lucide-react";
import type { AxiosError } from "axios";

import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { Textarea } from "@/src/shared/components/ui/textarea";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Loader } from "@/src/shared/components/ui/loader";
import {
  ValidatedField,
  validatedFieldInputClass,
  type FieldVisualState,
} from "@/src/shared/components/ui/validated-field";
import { getErrorMessage } from "@/src/core/utils/get-error-message";
import { cn } from "@/src/shared/lib/cn";

import { ResumeUploadField } from "@/src/features/jobs/components/resume-upload-field";
import { useJob } from "@/src/features/jobs/hooks/useJob";
import {
  publicJobApplicationSchema,
  validateResumeFile,
  type PublicJobApplicationFormValues,
} from "@/src/features/jobs/schemas/public-job-application.schema";
import { jobService } from "@/src/features/jobs/services/job.service";
import type { Job } from "@/src/features/jobs/types/job.types";
import { isJobAcceptingApplications } from "@/src/features/jobs/types/job.types";

interface PublicJobApplyPageProps {
  slug: string;
}

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

function employmentLabel(type: string) {
  return type.replaceAll("_", " ");
}

function salaryLabel(job: Job) {
  if (job.minSalary == null && job.maxSalary == null) {
    return null;
  }

  const min = job.minSalary?.toLocaleString("en-IN");
  const max = job.maxSalary?.toLocaleString("en-IN");

  if (min && max && min !== max) {
    return `₹${min} – ₹${max}`;
  }

  return `₹${min ?? max}`;
}

export function PublicJobApplyPage({ slug }: PublicJobApplyPageProps) {
  const router = useRouter();
  const { job, isLoading, error, refetch } = useJob(slug);
  const [resume, setResume] = useState<File | null>(null);
  const [resumeTouched, setResumeTouched] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, touchedFields, isSubmitted },
  } = useForm<PublicJobApplicationFormValues>({
    resolver: zodResolver(publicJobApplicationSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      applicantName: "",
      applicantEmail: "",
      applicantPhone: "",
      currentLocation: "",
      highestQualification: "",
      yearsOfExperience: undefined as unknown as number,
      coverLetter: "",
    },
  });

  const values = watch();
  const showValidation = isSubmitted;

  const fieldState = (
    name: keyof PublicJobApplicationFormValues,
    required = true,
  ) =>
    getSyncFieldState(
      Boolean(touchedFields[name] || showValidation),
      errors[name]?.message,
      name === "yearsOfExperience"
        ? String(values.yearsOfExperience ?? "")
        : String(values[name] ?? ""),
      required,
    );

  const visibleResumeError = useMemo(() => {
    if (!(resumeTouched || showValidation)) {
      return null;
    }
    return resumeError ?? validateResumeFile(resume);
  }, [resume, resumeError, resumeTouched, showValidation]);

  const submit = handleSubmit(async (formValues) => {
    const fileError = validateResumeFile(resume);
    setResumeTouched(true);
    setResumeError(fileError);

    if (fileError || !resume) {
      return;
    }

    if (isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);
      const result = await jobService.applyPublic(slug, formValues, resume);
      const params = new URLSearchParams({
        number: result.applicationNumber,
        date: result.createdAt,
        title: result.job?.title || job?.title || "",
      });
      router.replace(
        `/jobs/${encodeURIComponent(slug)}/apply/success?${params.toString()}`,
      );
    } catch (err) {
      setFormError(
        getErrorMessage(err as AxiosError) ||
          "Unable to submit your application. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader />
      </div>
    );
  }

  if (error || !job) {
    const notAccepting =
      (error ?? "").toLowerCase().includes("not accepting") ||
      (error ?? "").toLowerCase().includes("inactive") ||
      (error ?? "").toLowerCase().includes("no longer accepting");

    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <ErrorState
          title={notAccepting ? "Applications Closed" : "Job Not Found"}
          description={
            notAccepting
              ? "This position is currently not accepting applications."
              : (error ?? "This job is not available.")
          }
          onRetry={refetch}
        />
      </div>
    );
  }

  const accepting = isJobAcceptingApplications(job);

  return (
    <div className="px-4 py-8 sm:py-10">
      <div className="mx-auto w-full max-w-3xl space-y-5">
        <section className="rounded-2xl border border-[#DCE8F5] bg-white p-5 shadow-[0_8px_24px_rgba(16,42,86,0.06)] sm:p-6">
          <p className="text-sm font-medium text-[#2563EB]">
            {job.companyName || "MCJ Institute"}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#102A56] sm:text-3xl">
            {job.title}
          </h1>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-[#647A9B]">
            {job.jobNumber ? <span>{job.jobNumber}</span> : null}
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {job.location || job.city || "Location not specified"}
            </span>
            <span className="inline-flex items-center gap-1">
              <Briefcase className="h-4 w-4" />
              {employmentLabel(job.employmentType)}
            </span>
            {salaryLabel(job) ? <span>{salaryLabel(job)}</span> : null}
          </div>
          {job.description ? (
            <div className="mt-5">
              <p className="text-sm font-semibold text-[#102A56]">
                About the Role
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#102A56]">
                {job.description}
              </p>
            </div>
          ) : null}
          {job.skills?.length ? (
            <div className="mt-4">
              <p className="text-sm font-semibold text-[#102A56]">
                Requirements
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#647A9B]">
                {job.skills.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        {accepting ? (
        <section className="rounded-2xl border border-[#DCE8F5] bg-white p-5 shadow-[0_8px_24px_rgba(16,42,86,0.06)] sm:p-6">
          <h2 className="text-xl font-semibold text-[#102A56]">
            Apply for this Position
          </h2>
          <p className="mt-1 text-sm text-[#647A9B]">
            Complete the form below. Your application number will be generated
            after submission.
          </p>

          <form
            className="mt-5 space-y-4"
            noValidate
            onSubmit={(event) => {
              void submit(event);
            }}
          >
            <div className="grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-2">
              <ValidatedField
                label="Full Name"
                htmlFor="applicant-name"
                required
                state={fieldState("applicantName")}
                errorMessage={errors.applicantName?.message}
              >
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="applicant-name"
                  autoComplete="name"
                  className={validatedFieldInputClass(
                    fieldState("applicantName"),
                    "h-[46px] border-[#DCE8F5] pl-10",
                  )}
                  {...register("applicantName")}
                />
              </ValidatedField>

              <ValidatedField
                label="Email"
                htmlFor="applicant-email"
                required
                state={fieldState("applicantEmail")}
                errorMessage={errors.applicantEmail?.message}
              >
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="applicant-email"
                  type="email"
                  autoComplete="email"
                  className={validatedFieldInputClass(
                    fieldState("applicantEmail"),
                    "h-[46px] border-[#DCE8F5] pl-10",
                  )}
                  {...register("applicantEmail")}
                />
              </ValidatedField>

              <ValidatedField
                label="Phone Number"
                htmlFor="applicant-phone"
                required
                state={fieldState("applicantPhone")}
                errorMessage={errors.applicantPhone?.message}
              >
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="applicant-phone"
                  inputMode="numeric"
                  autoComplete="tel"
                  className={validatedFieldInputClass(
                    fieldState("applicantPhone"),
                    "h-[46px] border-[#DCE8F5] pl-10",
                  )}
                  {...register("applicantPhone")}
                />
              </ValidatedField>

              <ValidatedField
                label="Current Location"
                htmlFor="applicant-location"
                required
                state={fieldState("currentLocation")}
                errorMessage={errors.currentLocation?.message}
              >
                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="applicant-location"
                  className={validatedFieldInputClass(
                    fieldState("currentLocation"),
                    "h-[46px] border-[#DCE8F5] pl-10",
                  )}
                  {...register("currentLocation")}
                />
              </ValidatedField>

              <ValidatedField
                label="Highest Qualification"
                htmlFor="applicant-qualification"
                required
                state={fieldState("highestQualification")}
                errorMessage={errors.highestQualification?.message}
              >
                <Input
                  id="applicant-qualification"
                  className={validatedFieldInputClass(
                    fieldState("highestQualification"),
                    "h-[46px] border-[#DCE8F5]",
                  )}
                  {...register("highestQualification")}
                />
              </ValidatedField>

              <ValidatedField
                label="Years of Experience"
                htmlFor="applicant-experience"
                required
                state={fieldState("yearsOfExperience")}
                errorMessage={errors.yearsOfExperience?.message}
              >
                <Controller
                  name="yearsOfExperience"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="applicant-experience"
                      type="number"
                      min={0}
                      className={validatedFieldInputClass(
                        fieldState("yearsOfExperience"),
                        "h-[46px] border-[#DCE8F5]",
                      )}
                      value={
                        Number.isFinite(field.value) ? String(field.value) : ""
                      }
                      onBlur={field.onBlur}
                      onChange={(event) => {
                        const next = event.target.value;
                        field.onChange(
                          next === "" ? undefined : Number(next),
                        );
                      }}
                    />
                  )}
                />
              </ValidatedField>
            </div>

            <ValidatedField
              label="Cover Letter"
              htmlFor="applicant-cover-letter"
              state={fieldState("coverLetter", false)}
              errorMessage={errors.coverLetter?.message}
            >
              <Textarea
                id="applicant-cover-letter"
                rows={4}
                className={validatedFieldInputClass(
                  fieldState("coverLetter", false),
                  "min-h-[96px] border-[#DCE8F5]",
                )}
                {...register("coverLetter")}
              />
            </ValidatedField>

            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">
                Resume <span className="text-red-500">*</span>
              </p>
              <ResumeUploadField
                file={resume}
                error={visibleResumeError}
                disabled={isSubmitting}
                onFileSelect={(file) => {
                  setResumeTouched(true);
                  setResume(file);
                  setResumeError(validateResumeFile(file));
                }}
              />
            </div>

            {formError ? (
              <p role="alert" className="text-sm text-red-500">
                {formError}
              </p>
            ) : null}

            <div className="flex justify-end">
              <Button
                type="submit"
                className="h-[46px] bg-[#2563EB] px-6 hover:bg-[#1E3A8A]"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </form>
        </section>
        ) : (
          <section className="rounded-2xl border border-[#DCE8F5] bg-white p-5 text-center shadow-[0_8px_24px_rgba(16,42,86,0.06)] sm:p-6">
            <h2 className="text-xl font-semibold text-[#102A56]">
              Applications Closed
            </h2>
            <p className="mt-2 text-sm text-[#647A9B]">
              This position is currently not accepting applications.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}

export function PublicJobApplySuccess({
  jobTitle,
  applicationNumber,
  appliedAt,
}: {
  jobTitle: string;
  applicationNumber: string;
  appliedAt?: string;
}) {
  const appliedDate = appliedAt ? new Date(appliedAt) : null;
  const dateLabel =
    appliedDate && !Number.isNaN(appliedDate.getTime())
      ? appliedDate.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : null;

  return (
    <div className="px-4 py-16">
      <div className="mx-auto w-full max-w-xl rounded-2xl border border-[#DCE8F5] bg-white px-6 py-10 text-center shadow-[0_8px_24px_rgba(16,42,86,0.06)]">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
        <h1 className="mt-4 text-2xl font-bold text-[#102A56]">
          Application Submitted Successfully ✓
        </h1>
        <p className="mt-3 text-sm text-[#647A9B]">
          Your application has been received.
        </p>
        <div className="mt-6 space-y-4 rounded-xl border border-[#DCE8F5] bg-[#F8FBFF] px-4 py-4 text-left">
          <div>
            <p className="text-xs uppercase tracking-wide text-[#647A9B]">
              Application Number
            </p>
            <p className="mt-1 font-mono text-xl font-semibold text-[#2563EB]">
              {applicationNumber}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-[#647A9B]">
              Applied For
            </p>
            <p className="mt-1 text-sm font-semibold text-[#102A56]">
              {jobTitle}
            </p>
          </div>
          {dateLabel ? (
            <div>
              <p className="text-xs uppercase tracking-wide text-[#647A9B]">
                Application Date
              </p>
              <p className="mt-1 text-sm text-[#102A56]">{dateLabel}</p>
            </div>
          ) : null}
          <div>
            <p className="text-xs uppercase tracking-wide text-[#647A9B]">
              Status
            </p>
            <p className="mt-1 text-sm font-semibold text-amber-700">
              Pending Review
            </p>
          </div>
        </div>
        <p className="mt-6 text-sm text-[#647A9B]">
          Our recruitment team will review your application. Please keep your
          application number for future reference.
        </p>
      </div>
    </div>
  );
}
