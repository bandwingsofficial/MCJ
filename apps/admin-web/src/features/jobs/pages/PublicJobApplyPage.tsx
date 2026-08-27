"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Globe,
  IndianRupee,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { AxiosError } from "axios";

import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { Textarea } from "@/src/shared/components/ui/textarea";
import { AppSelect } from "@/src/shared/components/ui/select";
import { Loader } from "@/src/shared/components/ui/loader";
import {
  ValidatedField,
  validatedFieldInputClass,
} from "@/src/shared/components/ui/validated-field";
import { getErrorMessage, getErrorStatus } from "@/src/core/utils/get-error-message";

import { JobTagInput } from "@/src/features/jobs/components/JobTagInput";
import { ResumeUploadField } from "@/src/features/jobs/components/ResumeUploadField";
import {
  EMPLOYMENT_TYPES,
  JOB_QUALIFICATIONS,
  WORK_MODES,
} from "@/src/features/jobs/constants/job.constants";
import {
  buildApplicationRemarks,
  publicJobApplicationSchema,
  validateResumeFile,
  type PublicJobApplicationFormValues,
} from "@/src/features/jobs/schemas/public-job-application.schema";
import { jobService } from "@/src/features/jobs/services/job.service";
import type {
  Job,
  PublicJobApplicationResult,
} from "@/src/features/jobs/types/job.types";
import {
  isJobAcceptingApplications,
  isJobExpired,
} from "@/src/features/jobs/types/job.types";
import {
  formatInr,
  formatSalaryInput,
  getSyncFieldState,
  parseSalaryInput,
} from "@/src/features/jobs/utils/job-form.utils";

interface PublicJobApplyPageProps {
  slug: string;
}

type ClosedReason = "not-found" | "inactive" | "expired";

const GRID = "grid grid-cols-1 gap-x-4 gap-y-3 md:grid-cols-2";

function getApiCode(error: unknown): string | undefined {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { code?: string } | undefined;
    return data?.code;
  }
  return undefined;
}

function resolveClosedReason(
  job: Job | null,
  error: unknown,
): ClosedReason | null {
  if (job) {
    if (
      job.isDeleted ||
      job.status === "DRAFT" ||
      job.status === "PENDING_APPROVAL" ||
      job.status === "REJECTED"
    ) {
      return "not-found";
    }
    if (isJobExpired(job) || job.status === "EXPIRED") {
      return "expired";
    }
    if (!job.isActive || job.status === "CLOSED" || job.status !== "ACTIVE") {
      return "inactive";
    }
    return null;
  }

  const status = getErrorStatus(error);
  const code = getApiCode(error);
  const message = getErrorMessage(error).toLowerCase();

  if (
    status === 404 ||
    code === "JOB_NOT_FOUND" ||
    code === "JOB_DELETED" ||
    message.includes("deleted") ||
    message.includes("not found")
  ) {
    return "not-found";
  }

  if (code === "JOB_EXPIRED" || message.includes("no longer accepting")) {
    return "expired";
  }

  if (
    code === "JOB_INACTIVE" ||
    code === "JOB_CLOSED" ||
    message.includes("not accepting")
  ) {
    return "inactive";
  }

  return "not-found";
}

function employmentLabel(type: string) {
  return (
    EMPLOYMENT_TYPES.find((item) => item.value === type)?.label ??
    type.replaceAll("_", " ")
  );
}

function workModeLabel(mode: string) {
  return WORK_MODES.find((item) => item.value === mode)?.label ?? mode;
}

function experienceLabel(job: Job) {
  const min = job.minExperience ?? 0;
  const max = job.maxExperience;
  if (max == null || max === min) {
    return `${min} yr${min === 1 ? "" : "s"}`;
  }
  return `${min}–${max} yrs`;
}

function salaryLabel(job: Job) {
  if (job.minSalary == null && job.maxSalary == null) {
    return "—";
  }
  if (job.maxSalary == null || job.maxSalary === job.minSalary) {
    return formatInr(job.minSalary);
  }
  return `${formatInr(job.minSalary)} – ${formatInr(job.maxSalary)}`;
}

function deadlineLabel(value: string | null) {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function PublicJobApplyPage({ slug }: PublicJobApplyPageProps) {
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [resume, setResume] = useState<File | null>(null);
  const [resumeTouched, setResumeTouched] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<PublicJobApplicationResult | null>(null);

  const loadJob = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const data = await jobService.getPublicJobBySlug(slug);
      setJob(data);
    } catch (error) {
      setJob(null);
      setLoadError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadJob();
  }, [slug]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, touchedFields, isSubmitted },
  } = useForm<PublicJobApplicationFormValues>({
    resolver: zodResolver(publicJobApplicationSchema) as never,
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      applicantName: "",
      applicantEmail: "",
      applicantPhone: "",
      currentLocation: "",
      highestQualification: "",
      course: "",
      yearsOfExperience: undefined as unknown as number,
      currentCompany: "",
      skills: [],
      noticePeriod: "",
      expectedSalary: undefined,
      coverLetter: "",
      portfolioUrl: "",
      linkedinUrl: "",
      additionalInformation: "",
    },
  });

  const values = watch();
  const showValidation = isSubmitted;

  const fieldState = (
    name: keyof PublicJobApplicationFormValues,
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

  const inputClass = (name: keyof PublicJobApplicationFormValues, extra = "") =>
    validatedFieldInputClass(
      fieldState(name, extra !== "optional"),
      `h-[46px] w-full ${extra}`,
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

    try {
      setIsSubmitting(true);
      setFormError(null);
      const formData = new FormData();
      formData.append("applicantName", formValues.applicantName);
      formData.append("applicantEmail", formValues.applicantEmail);
      formData.append("applicantPhone", formValues.applicantPhone);
      formData.append("currentLocation", formValues.currentLocation);
      formData.append("highestQualification", formValues.highestQualification);
      formData.append("yearsOfExperience", String(formValues.yearsOfExperience));
      if (formValues.coverLetter?.trim()) {
        formData.append("coverLetter", formValues.coverLetter.trim());
      }
      if (formValues.expectedSalary != null) {
        formData.append("expectedSalary", String(formValues.expectedSalary));
      }
      const remarks = buildApplicationRemarks(formValues);
      if (remarks) {
        formData.append("remarks", remarks);
      }
      formData.append("resume", resume);

      const submitted = await jobService.applyPublicJob(slug, formData);
      setResult(submitted);
    } catch (error) {
      setFormError(
        getErrorMessage(error) ||
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

  if (result) {
    const submittedOn = new Date(result.createdAt).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-12">
        <div className="rounded-2xl border border-[#DCE8F5] bg-white px-6 py-10 text-center shadow-[0_8px_24px_rgba(16,42,86,0.06)] sm:px-10">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#102A56]">
            Application Submitted Successfully
          </h1>
          <dl className="mx-auto mt-8 grid max-w-md grid-cols-1 gap-3 text-left">
            <div className="rounded-xl border border-[#E8F1FF] bg-[#F8FBFF] px-4 py-3">
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
                Application Number
              </dt>
              <dd className="mt-1 font-mono text-lg font-semibold text-[#2563EB]">
                {result.applicationNumber}
              </dd>
            </div>
            <div className="rounded-xl border border-[#E8F1FF] bg-[#F8FBFF] px-4 py-3">
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
                Job
              </dt>
              <dd className="mt-1 text-sm font-semibold text-[#102A56]">
                {result.job?.title || job?.title}
              </dd>
            </div>
            <div className="rounded-xl border border-[#E8F1FF] bg-[#F8FBFF] px-4 py-3">
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
                Company
              </dt>
              <dd className="mt-1 text-sm font-semibold text-[#102A56]">
                {result.job?.companyName || job?.companyName}
              </dd>
            </div>
            <div className="rounded-xl border border-[#E8F1FF] bg-[#F8FBFF] px-4 py-3">
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
                Submitted
              </dt>
              <dd className="mt-1 text-sm font-semibold text-[#102A56]">
                {submittedOn}
              </dd>
            </div>
            <div className="rounded-xl border border-[#E8F1FF] bg-[#F8FBFF] px-4 py-3">
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
                Status
              </dt>
              <dd className="mt-1 text-sm font-semibold text-amber-700">
                Pending Review
              </dd>
            </div>
          </dl>
        </div>
      </div>
    );
  }

  const closedReason = resolveClosedReason(job, loadError);

  if (!job || closedReason === "not-found") {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16">
        <div className="rounded-2xl border border-[#DCE8F5] bg-white px-6 py-10 text-center shadow-[0_8px_24px_rgba(16,42,86,0.06)]">
          <h1 className="text-2xl font-bold text-[#102A56]">Job Not Found</h1>
          <p className="mt-3 text-sm text-[#647A9B]">
            This job is not available or is no longer publicly listed.
          </p>
        </div>
      </div>
    );
  }

  const accepting = isJobAcceptingApplications(job) && !closedReason;
  const closedTitle =
    closedReason === "expired"
      ? "Applications Closed"
      : "Applications are currently closed for this position.";
  const closedCopy =
    closedReason === "expired"
      ? "The application deadline for this position has passed."
      : "This position is currently not accepting applications.";

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:py-8">
      <section className="rounded-2xl border border-[#DCE8F5] bg-white p-5 shadow-[0_8px_24px_rgba(16,42,86,0.06)] sm:p-6">
        <p className="text-sm font-semibold text-[#2563EB]">{job.companyName}</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#102A56] sm:text-3xl">
          {job.title}
        </h1>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
              Company
            </dt>
            <dd className="mt-1 font-medium text-[#102A56]">{job.companyName}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
              Job Type
            </dt>
            <dd className="mt-1 font-medium text-[#102A56]">
              {employmentLabel(job.employmentType)}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
              Location
            </dt>
            <dd className="mt-1 font-medium text-[#102A56]">
              {job.location || job.city || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
              Work Mode
            </dt>
            <dd className="mt-1 font-medium text-[#102A56]">
              {workModeLabel(job.workMode)}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
              Experience
            </dt>
            <dd className="mt-1 font-medium text-[#102A56]">
              {experienceLabel(job)}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
              Salary
            </dt>
            <dd className="mt-1 font-medium text-[#102A56]">{salaryLabel(job)}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
              Openings
            </dt>
            <dd className="mt-1 font-medium text-[#102A56]">{job.vacancies}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
              Application Deadline
            </dt>
            <dd className="mt-1 font-medium text-[#102A56]">
              {deadlineLabel(job.applicationDeadline)}
            </dd>
          </div>
        </dl>
      </section>

      {!accepting ? (
        <section className="mt-5 rounded-2xl border border-[#DCE8F5] bg-white p-6 text-center shadow-[0_8px_24px_rgba(16,42,86,0.06)]">
          <h2 className="text-xl font-semibold text-[#102A56]">{closedTitle}</h2>
          <p className="mt-2 text-sm text-[#647A9B]">{closedCopy}</p>
        </section>
      ) : (
        <section className="mt-5 rounded-2xl border border-[#DCE8F5] bg-white p-5 shadow-[0_8px_24px_rgba(16,42,86,0.06)] sm:p-6">
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
            <h3 className="border-b border-[#E8F1FF] pb-1.5 text-xs font-semibold uppercase tracking-wide text-[#2563EB]">
              Personal Information
            </h3>
            <div className={GRID}>
              <ValidatedField
                label="Full Name"
                required
                state={fieldState("applicantName")}
                errorMessage={errors.applicantName?.message}
              >
                <User className="pointer-events-none absolute left-3 top-1/2 z-[1] h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  autoComplete="name"
                  disabled={isSubmitting}
                  className={validatedFieldInputClass(
                    fieldState("applicantName"),
                    "h-[46px] pl-10",
                  )}
                  {...register("applicantName")}
                />
              </ValidatedField>
              <ValidatedField
                label="Email"
                required
                state={fieldState("applicantEmail")}
                errorMessage={errors.applicantEmail?.message}
              >
                <Mail className="pointer-events-none absolute left-3 top-1/2 z-[1] h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="email"
                  autoComplete="email"
                  disabled={isSubmitting}
                  className={validatedFieldInputClass(
                    fieldState("applicantEmail"),
                    "h-[46px] pl-10",
                  )}
                  {...register("applicantEmail")}
                />
              </ValidatedField>
              <ValidatedField
                label="Phone"
                required
                state={fieldState("applicantPhone")}
                errorMessage={errors.applicantPhone?.message}
              >
                <Phone className="pointer-events-none absolute left-3 top-1/2 z-[1] h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  inputMode="numeric"
                  autoComplete="tel"
                  disabled={isSubmitting}
                  className={validatedFieldInputClass(
                    fieldState("applicantPhone"),
                    "h-[46px] pl-10",
                  )}
                  {...register("applicantPhone")}
                />
              </ValidatedField>
              <ValidatedField
                label="Current Location"
                required
                state={fieldState("currentLocation")}
                errorMessage={errors.currentLocation?.message}
              >
                <MapPin className="pointer-events-none absolute left-3 top-1/2 z-[1] h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  disabled={isSubmitting}
                  className={validatedFieldInputClass(
                    fieldState("currentLocation"),
                    "h-[46px] pl-10",
                  )}
                  {...register("currentLocation")}
                />
              </ValidatedField>
            </div>

            <h3 className="border-b border-[#E8F1FF] pb-1.5 text-xs font-semibold uppercase tracking-wide text-[#2563EB]">
              Professional Information
            </h3>
            <div className={GRID}>
              <ValidatedField
                label="Highest Qualification"
                required
                state={fieldState("highestQualification")}
                errorMessage={errors.highestQualification?.message}
              >
                <Controller
                  name="highestQualification"
                  control={control}
                  render={({ field }) => (
                    <AppSelect
                      value={field.value || undefined}
                      disabled={isSubmitting}
                      placeholder="Select qualification"
                      triggerClassName={validatedFieldInputClass(
                        fieldState("highestQualification"),
                        "h-[46px]",
                      )}
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
                label="Course / Degree"
                state={fieldState("course", false)}
                errorMessage={errors.course?.message}
              >
                <Input
                  disabled={isSubmitting}
                  className={validatedFieldInputClass(
                    fieldState("course", false),
                    "h-[46px]",
                  )}
                  placeholder="B.Com, BCA..."
                  {...register("course")}
                />
              </ValidatedField>
              <ValidatedField
                label="Experience (years)"
                required
                state={fieldState("yearsOfExperience")}
                errorMessage={errors.yearsOfExperience?.message}
              >
                <Briefcase className="pointer-events-none absolute left-3 top-1/2 z-[1] h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Controller
                  name="yearsOfExperience"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="number"
                      min={0}
                      disabled={isSubmitting}
                      className={validatedFieldInputClass(
                        fieldState("yearsOfExperience"),
                        "h-[46px] pl-10",
                      )}
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
                state={fieldState("currentCompany", false)}
                errorMessage={errors.currentCompany?.message}
              >
                <Building2 className="pointer-events-none absolute left-3 top-1/2 z-[1] h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  disabled={isSubmitting}
                  className={validatedFieldInputClass(
                    fieldState("currentCompany", false),
                    "h-[46px] pl-10",
                  )}
                  {...register("currentCompany")}
                />
              </ValidatedField>
              <ValidatedField
                label="Notice Period"
                state={fieldState("noticePeriod", false)}
                errorMessage={errors.noticePeriod?.message}
              >
                <Calendar className="pointer-events-none absolute left-3 top-1/2 z-[1] h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  disabled={isSubmitting}
                  placeholder="Immediate / 30 days"
                  className={validatedFieldInputClass(
                    fieldState("noticePeriod", false),
                    "h-[46px] pl-10",
                  )}
                  {...register("noticePeriod")}
                />
              </ValidatedField>
              <ValidatedField
                label="Expected Salary"
                state={fieldState("expectedSalary", false)}
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
                      placeholder="35,000"
                      className={validatedFieldInputClass(
                        fieldState("expectedSalary", false),
                        "h-[46px] pl-10",
                      )}
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
                    placeholder="Excel, Tally, GST"
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                  />
                )}
              />
            </ValidatedField>

            <h3 className="border-b border-[#E8F1FF] pb-1.5 text-xs font-semibold uppercase tracking-wide text-[#2563EB]">
              Resume
            </h3>
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">
                Resume / CV <span className="text-red-500">*</span>
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

            <h3 className="border-b border-[#E8F1FF] pb-1.5 text-xs font-semibold uppercase tracking-wide text-[#2563EB]">
              Additional
            </h3>
            <ValidatedField
              label="Cover Letter"
              state={fieldState("coverLetter", false)}
              errorMessage={errors.coverLetter?.message}
            >
              <Textarea
                rows={3}
                disabled={isSubmitting}
                className={validatedFieldInputClass(
                  fieldState("coverLetter", false),
                  "min-h-[80px]",
                )}
                {...register("coverLetter")}
              />
            </ValidatedField>
            <div className={GRID}>
              <ValidatedField
                label="Portfolio URL"
                state={fieldState("portfolioUrl", false)}
                errorMessage={errors.portfolioUrl?.message}
              >
                <Input
                  disabled={isSubmitting}
                  placeholder="https://"
                  className={validatedFieldInputClass(
                    fieldState("portfolioUrl", false),
                    "h-[46px]",
                  )}
                  {...register("portfolioUrl")}
                />
              </ValidatedField>
              <ValidatedField
                label="LinkedIn URL"
                state={fieldState("linkedinUrl", false)}
                errorMessage={errors.linkedinUrl?.message}
              >
                <Globe className="pointer-events-none absolute left-3 top-1/2 z-[1] h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  disabled={isSubmitting}
                  placeholder="https://linkedin.com/in/..."
                  className={validatedFieldInputClass(
                    fieldState("linkedinUrl", false),
                    "h-[46px] pl-10",
                  )}
                  {...register("linkedinUrl")}
                />
              </ValidatedField>
            </div>
            <ValidatedField
              label="Additional information"
              state={fieldState("additionalInformation", false)}
              errorMessage={errors.additionalInformation?.message}
            >
              <Textarea
                rows={2}
                disabled={isSubmitting}
                className={validatedFieldInputClass(
                  fieldState("additionalInformation", false),
                  "min-h-[72px]",
                )}
                {...register("additionalInformation")}
              />
            </ValidatedField>

            {formError ? (
              <p
                role="alert"
                className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {formError}
              </p>
            ) : null}

            <Button
              type="submit"
              className="h-12 w-full"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          </form>
        </section>
      )}
    </div>
  );
}
