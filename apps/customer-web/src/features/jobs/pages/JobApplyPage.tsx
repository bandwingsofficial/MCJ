"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Hourglass,
  MapPin,
} from "lucide-react";

import { useAuthStore } from "@/src/features/auth/store/auth.store";
import { tokenStorage } from "@/src/core/storage/token-storage";
import { getErrorMessage } from "@/src/core/utils/get-error-message";
import { Button } from "@/src/shared/components/ui/button";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { FormError } from "@/src/shared/components/ui/form-error";
import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";
import { Loader } from "@/src/shared/components/ui/loader";
import { AppSelect } from "@/src/shared/components/ui/select";
import { GENDER_OPTIONS } from "@/src/features/student/constants";
import { ResumeUploadField } from "@/src/features/jobs/components/resume-upload-field";
import { useJob } from "@/src/features/jobs/hooks/useJob";
import {
  jobApplicationStudentSchema,
  validateJobApplicationResumeFile,
  type JobApplicationStudentFormValues,
} from "@/src/features/jobs/schemas/job-application-student.schema";
import { jobService } from "@/src/features/jobs/services/job.service";
import type { Job } from "@/src/features/jobs/types/job.types";
import { isJobAcceptingApplications } from "@/src/features/jobs/types/job.types";
import {
  employmentLabel,
  experienceLabel,
  formatPostedDate,
  locationLabel,
  salaryLabel,
} from "@/src/features/jobs/utils/job-display.utils";
import { useStudentPortalNavigation } from "@/src/features/student/context/StudentPortalNavigationProvider";
import type { StudentProfile } from "@/src/features/student/types";
import { cn } from "@/src/shared/lib/cn";

interface JobApplyPageProps {
  slug: string;
}

function useAuthSessionReady() {
  const [authReady, setAuthReady] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setAuthReady(true);
      return;
    }

    return useAuthStore.persist.onFinishHydration(() => {
      setAuthReady(true);
    });
  }, []);

  return {
    authReady,
    isAuthenticated:
      authReady &&
      Boolean(tokenStorage.getAccessToken()) &&
      isAuthenticated,
  };
}

function toDateInputValue(value?: string | null) {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
}

function buildJobApplicationPrefill(input: {
  email?: string | null;
  phone?: string | null;
  studentProfile: StudentProfile | null;
}): JobApplicationStudentFormValues {
  const profile = input.studentProfile;

  return {
    firstName: profile?.firstName ?? "",
    lastName: profile?.lastName ?? "",
    email: profile?.email || input.email || "",
    phone: profile?.phone || input.phone || "",
    gender: profile?.gender ?? "MALE",
    dateOfBirth: toDateInputValue(profile?.dateOfBirth),
    addressLine1: profile?.addressLine1 ?? "",
    addressLine2: profile?.addressLine2 ?? "",
    city: profile?.city ?? "",
    state: profile?.state ?? "",
    country: profile?.country || "India",
    postalCode: profile?.postalCode ?? "",
    qualification: profile?.qualification ?? "",
    collegeName: profile?.collegeName ?? "",
    specialization: profile?.specialization ?? "",
    passingYear: profile?.passingYear || new Date().getFullYear(),
  };
}

function availableSalary(job: Job) {
  if (job.minSalary == null && job.maxSalary == null) {
    return null;
  }
  return salaryLabel(job);
}

function FieldShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("space-y-1.5", className)}>{children}</div>;
}

function FormSection({
  step,
  title,
  description,
  children,
}: {
  step: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_2px_12px_rgba(11,31,58,0.04)] sm:p-6">
      <div className="mb-5 flex items-start gap-3 border-b border-slate-100 pb-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF] text-xs font-bold text-[#2563EB]">
          {step}
        </span>
        <div>
          <h2 className="text-base font-bold tracking-tight text-[#0B1F3A] sm:text-lg">
            {title}
          </h2>
          {description ? (
            <p className="mt-0.5 text-sm text-slate-500">{description}</p>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  );
}

function MetaChip({
  icon: Icon,
  value,
}: {
  icon: typeof MapPin;
  value: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white/90 px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm sm:text-sm">
      <Icon className="h-3.5 w-3.5 shrink-0 text-[#2563EB]" />
      {value}
    </span>
  );
}

function ProgressSteps({
  detailsReady,
  resumeReady,
}: {
  detailsReady: boolean;
  resumeReady: boolean;
}) {
  const steps = [
    { label: "Your details", done: detailsReady },
    { label: "Resume", done: resumeReady },
    { label: "Submit", done: false },
  ];
  const activeIndex = detailsReady ? (resumeReady ? 2 : 1) : 0;

  return (
    <div className="mt-5 flex flex-wrap items-center gap-2 sm:gap-3">
      {steps.map((step, index) => (
        <div key={step.label} className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold",
                step.done
                  ? "bg-emerald-500 text-white"
                  : index === activeIndex
                    ? "bg-[#2F6BE5] text-white"
                    : "bg-white text-slate-400 ring-1 ring-slate-200",
              )}
            >
              {step.done ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                index + 1
              )}
            </span>
            <span
              className={cn(
                "text-xs font-medium sm:text-sm",
                step.done || index === activeIndex
                  ? "text-[#0B1F3A]"
                  : "text-slate-400",
              )}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 ? (
            <span className="hidden h-px w-6 bg-slate-200 sm:block" />
          ) : null}
        </div>
      ))}
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-2.5 last:border-b-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-right text-sm font-semibold text-[#0B1F3A]">
        {value}
      </span>
    </div>
  );
}

export function JobApplyPage({ slug }: JobApplyPageProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { studentProfile, refetch: refetchStudentState } =
    useStudentPortalNavigation();
  const { authReady, isAuthenticated } = useAuthSessionReady();
  const { job, isLoading, error, refetch } = useJob(slug);
  const [resume, setResume] = useState<File | null>(null);
  const [resumeTouched, setResumeTouched] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loginRedirect = `/login?redirect=${encodeURIComponent(`/jobs/${slug}/apply`)}`;

  useEffect(() => {
    if (!authReady) {
      return;
    }

    if (!isAuthenticated) {
      router.replace(loginRedirect);
    }
  }, [authReady, isAuthenticated, loginRedirect, router]);

  const form = useForm<JobApplicationStudentFormValues>({
    resolver: zodResolver(jobApplicationStudentSchema),
    defaultValues: buildJobApplicationPrefill({
      email: user?.email,
      phone: user?.phone,
      studentProfile,
    }),
  });

  const {
    register,
    setValue,
    reset,
    watch,
    handleSubmit,
    formState: { errors },
  } = form;

  useEffect(() => {
    reset(
      buildJobApplicationPrefill({
        email: user?.email,
        phone: user?.phone,
        studentProfile,
      }),
    );
  }, [reset, studentProfile, user?.email, user?.phone]);

  const acceptingApplications = useMemo(
    () => (job ? isJobAcceptingApplications(job) : false),
    [job],
  );

  const watchedFirstName = watch("firstName");
  const watchedEmail = watch("email");
  const watchedPhone = watch("phone");
  const watchedDob = watch("dateOfBirth");
  const watchedAddress = watch("addressLine1");
  const watchedQualification = watch("qualification");

  const detailsReady = Boolean(
    watchedFirstName?.trim() &&
      watchedEmail?.trim() &&
      watchedPhone?.trim() &&
      watchedDob?.trim() &&
      watchedAddress?.trim() &&
      watchedQualification?.trim(),
  );
  const resumeReady = Boolean(resume);

  const visibleResumeError =
    resumeTouched || form.formState.isSubmitted ? resumeError : null;

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    setResumeTouched(true);
    const nextResumeError = validateJobApplicationResumeFile(resume);
    setResumeError(nextResumeError);

    if (nextResumeError || !resume) {
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await jobService.applyWithStudent(slug, values, resume);

      void refetchStudentState();

      const params = new URLSearchParams({
        id: result.id,
        number: result.applicationNumber,
        title: result.job?.title ?? job?.title ?? "",
        company: result.job?.companyName ?? job?.companyName ?? "",
        date: result.createdAt,
        slug,
        studentId: result.student?.studentCode ?? result.studentId ?? "",
        studentName: [result.student?.firstName, result.student?.lastName]
          .filter(Boolean)
          .join(" ")
          .trim(),
        resume: result.resumeFileId ? "yes" : "no",
      });

      router.push(`/jobs/${slug}/apply/success?${params.toString()}`);
    } catch (submitError) {
      setFormError(
        getErrorMessage(submitError) || "Unable to submit your application.",
      );
    } finally {
      setIsSubmitting(false);
    }
  });

  if (!authReady || !isAuthenticated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#F8FBFF]">
        <Loader />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#F8FBFF]">
        <Loader />
      </div>
    );
  }

  if (error || !job) {
    return (
      <main className="min-h-[60vh] bg-[#F8FBFF]">
        <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-20 text-center sm:px-6">
          <ErrorState
            title="Unable to load job"
            description={getErrorMessage(error) || "This job could not be found."}
            onRetry={refetch}
          />
          <Link
            href="/jobs"
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-[#0B1F3A] transition hover:border-[#2563EB]/30 hover:text-[#2563EB]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </Link>
        </div>
      </main>
    );
  }

  const salary = availableSalary(job);

  return (
    <main className="min-h-screen bg-[#F8FBFF] pb-12">
      {/* Application hero — MCJ light blue/lavender gradient */}
      <section className="relative overflow-hidden border-b border-slate-100 bg-[#F8FBFF]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#EFF6FF] to-transparent" />
        <div className="pointer-events-none absolute -right-16 top-0 h-48 w-48 rounded-full bg-[#E0E7FF]/45 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/4 h-36 w-36 rounded-full bg-[#EDE9FE]/35 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-7 lg:px-8">
          <Link
            href={`/jobs/${slug}`}
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 transition-colors hover:text-[#2563EB]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Job Details
          </Link>

          <div className="inline-flex items-center gap-2 rounded-full border border-[#BFDBFE] bg-white px-3 py-1 text-xs font-semibold text-[#2563EB]">
            <FileText className="h-3.5 w-3.5" />
            Applying for this role
          </div>

          <h1 className="mt-3 max-w-3xl text-2xl font-bold tracking-tight text-[#0B1F3A] sm:text-3xl">
            {job.title}
          </h1>
          <p className="mt-1.5 flex items-center gap-2 text-base font-medium text-slate-600">
            <Building2 className="h-4 w-4 shrink-0 text-[#2563EB]" />
            {job.companyName}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <MetaChip icon={MapPin} value={locationLabel(job)} />
            <MetaChip icon={Briefcase} value={employmentLabel(job)} />
            <MetaChip icon={Hourglass} value={experienceLabel(job)} />
          </div>

          {acceptingApplications ? (
            <ProgressSteps
              detailsReady={detailsReady}
              resumeReady={resumeReady}
            />
          ) : null}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {!acceptingApplications ? (
          <section className="mx-auto max-w-xl rounded-2xl border border-slate-200/90 bg-white px-6 py-12 text-center shadow-[0_8px_28px_rgba(11,31,58,0.06)]">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
              <Clock3 className="h-6 w-6 text-amber-600" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-[#0B1F3A]">
              Applications Closed
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              This position is currently not accepting applications.
            </p>
            <Link
              href={`/jobs/${slug}`}
              className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#2F6BE5] to-[#1E49A8] px-5 text-sm font-semibold text-white transition hover:from-[#2860D4] hover:to-[#1A3F96]"
            >
              View Job Details
            </Link>
          </section>
        ) : (
          <form onSubmit={onSubmit}>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(280px,3fr)] lg:gap-8">
              {/* Main application form */}
              <div className="order-2 space-y-5 lg:order-1">
                <FormSection
                  step="01"
                  title="Personal Information"
                  description="Email and phone are locked to your account."
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FieldShell>
                      <Label required>First Name</Label>
                      <Input
                        {...register("firstName")}
                        placeholder="Enter first name"
                      />
                      <FormError message={errors.firstName?.message} />
                    </FieldShell>
                    <FieldShell>
                      <Label>Last Name</Label>
                      <Input
                        {...register("lastName")}
                        placeholder="Enter last name"
                      />
                      <FormError message={errors.lastName?.message} />
                    </FieldShell>
                    <FieldShell>
                      <Label required>Email</Label>
                      <input type="hidden" {...register("email")} />
                      <Input
                        type="email"
                        value={watch("email") ?? ""}
                        readOnly
                        disabled
                        tabIndex={-1}
                        placeholder="Enter email"
                        className="bg-slate-50"
                      />
                      <FormError message={errors.email?.message} />
                    </FieldShell>
                    <FieldShell>
                      <Label required>Phone Number</Label>
                      <input type="hidden" {...register("phone")} />
                      <Input
                        type="tel"
                        value={watch("phone") ?? ""}
                        readOnly
                        disabled
                        tabIndex={-1}
                        placeholder="Enter phone number"
                        className="bg-slate-50"
                      />
                      <FormError message={errors.phone?.message} />
                    </FieldShell>
                    <FieldShell>
                      <Label required>Gender</Label>
                      <AppSelect
                        value={watch("gender")}
                        options={GENDER_OPTIONS}
                        onValueChange={(value) =>
                          setValue(
                            "gender",
                            value as "MALE" | "FEMALE" | "OTHER",
                            { shouldValidate: true },
                          )
                        }
                      />
                      <FormError message={errors.gender?.message} />
                    </FieldShell>
                    <FieldShell>
                      <Label required>Date of Birth</Label>
                      <Input type="date" {...register("dateOfBirth")} />
                      <FormError message={errors.dateOfBirth?.message} />
                    </FieldShell>
                  </div>
                </FormSection>

                <FormSection step="02" title="Address Information">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FieldShell className="sm:col-span-2">
                      <Label required>Address Line 1</Label>
                      <Input {...register("addressLine1")} />
                      <FormError message={errors.addressLine1?.message} />
                    </FieldShell>
                    <FieldShell className="sm:col-span-2">
                      <Label>Address Line 2</Label>
                      <Input {...register("addressLine2")} />
                      <FormError message={errors.addressLine2?.message} />
                    </FieldShell>
                    <FieldShell>
                      <Label required>City</Label>
                      <Input {...register("city")} />
                      <FormError message={errors.city?.message} />
                    </FieldShell>
                    <FieldShell>
                      <Label required>State</Label>
                      <Input {...register("state")} />
                      <FormError message={errors.state?.message} />
                    </FieldShell>
                    <FieldShell>
                      <Label required>Country</Label>
                      <Input {...register("country")} />
                      <FormError message={errors.country?.message} />
                    </FieldShell>
                    <FieldShell>
                      <Label required>Postal Code</Label>
                      <Input {...register("postalCode")} />
                      <FormError message={errors.postalCode?.message} />
                    </FieldShell>
                  </div>
                </FormSection>

                <FormSection step="03" title="Education Details">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FieldShell>
                      <Label required>Qualification</Label>
                      <Input {...register("qualification")} />
                      <FormError message={errors.qualification?.message} />
                    </FieldShell>
                    <FieldShell>
                      <Label required>College Name</Label>
                      <Input {...register("collegeName")} />
                      <FormError message={errors.collegeName?.message} />
                    </FieldShell>
                    <FieldShell>
                      <Label required>Specialization</Label>
                      <Input {...register("specialization")} />
                      <FormError message={errors.specialization?.message} />
                    </FieldShell>
                    <FieldShell>
                      <Label required>Passing Year</Label>
                      <Input
                        type="number"
                        {...register("passingYear", { valueAsNumber: true })}
                      />
                      <FormError message={errors.passingYear?.message} />
                    </FieldShell>
                  </div>
                </FormSection>

                <FormSection
                  step="04"
                  title="Resume"
                  description="Upload your resume in PDF format only. Required to submit."
                >
                  <div
                    className={cn(
                      "rounded-2xl p-1",
                      resume
                        ? "bg-gradient-to-br from-emerald-50 to-white"
                        : "bg-gradient-to-br from-[#EFF6FF] to-[#F5F3FF]",
                    )}
                  >
                    <ResumeUploadField
                      file={resume}
                      pdfOnly
                      error={visibleResumeError}
                      disabled={isSubmitting}
                      onFileSelect={(file) => {
                        setResumeTouched(true);
                        setResume(file);
                        setResumeError(validateJobApplicationResumeFile(file));
                      }}
                    />
                  </div>
                </FormSection>

                {formError ? (
                  <p
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
                  >
                    {formError}
                  </p>
                ) : null}

                {/* Mobile-only submit (hidden on lg — sidebar CTA handles desktop) */}
                <div className="lg:hidden">
                  <Button
                    type="submit"
                    size="lg"
                    className="h-12 w-full rounded-xl bg-gradient-to-r from-[#2F6BE5] to-[#1E49A8] text-sm font-semibold text-white hover:from-[#2860D4] hover:to-[#1A3F96]"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </Button>
                </div>
              </div>

              {/* Sticky application summary */}
              <aside className="order-1 lg:order-2 lg:sticky lg:top-20 lg:self-start">
                <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_8px_28px_rgba(11,31,58,0.06)]">
                  <div className="border-b border-slate-100 bg-gradient-to-br from-[#0B1F3A] to-[#102A56] px-5 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#93C5FD]">
                      Application Summary
                    </p>
                    <h3 className="mt-1.5 text-lg font-bold leading-snug text-white">
                      {job.title}
                    </h3>
                    <p className="mt-1 text-sm text-white/75">
                      {job.companyName}
                    </p>
                  </div>

                  <div className="space-y-0 px-5 py-2">
                    <SummaryRow label="Location" value={locationLabel(job)} />
                    <SummaryRow
                      label="Experience"
                      value={experienceLabel(job)}
                    />
                    <SummaryRow
                      label="Employment"
                      value={employmentLabel(job)}
                    />
                    {salary ? (
                      <SummaryRow label="Salary" value={salary} />
                    ) : null}
                    <SummaryRow
                      label="Posted"
                      value={formatPostedDate(job.createdAt)}
                    />
                    <div className="flex items-start justify-between gap-3 py-2.5">
                      <span className="text-sm text-slate-500">Resume</span>
                      <span
                        className={cn(
                          "text-right text-sm font-semibold",
                          resumeReady
                            ? "text-emerald-600"
                            : "text-amber-600",
                        )}
                      >
                        {resumeReady ? "Ready to upload" : "PDF required"}
                      </span>
                    </div>
                  </div>

                  <div className="hidden border-t border-slate-100 px-5 py-4 lg:block">
                    <Button
                      type="submit"
                      size="lg"
                      className="h-12 w-full rounded-xl bg-gradient-to-r from-[#2F6BE5] to-[#1E49A8] text-sm font-semibold text-white hover:from-[#2860D4] hover:to-[#1A3F96]"
                      loading={isSubmitting}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Submit Application"}
                    </Button>
                  </div>

                  <div className="border-t border-slate-100 px-5 py-3 lg:hidden">
                    <p className="text-xs text-slate-500">
                      Complete the form below, then submit your application.
                    </p>
                  </div>
                </div>

                <div className="mt-3 hidden items-center gap-2 rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2.5 text-xs text-slate-500 lg:flex">
                  <CalendarDays className="h-3.5 w-3.5 shrink-0 text-[#2563EB]" />
                  Posted {formatPostedDate(job.createdAt)}
                  {job.jobNumber ? (
                    <span className="ml-auto font-semibold text-[#2563EB]">
                      {job.jobNumber}
                    </span>
                  ) : null}
                </div>
              </aside>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}

export function JobApplySuccess({
  jobTitle,
  companyName,
  applicationNumber,
  studentId,
  studentName,
  appliedAt,
  resumeSubmitted,
  slug,
  applicationStatus,
  isLoadingStatus = false,
}: {
  jobTitle: string;
  companyName: string;
  applicationNumber: string;
  studentId: string;
  studentName: string;
  appliedAt?: string;
  resumeSubmitted: boolean;
  slug?: string;
  applicationStatus?: string | null;
  isLoadingStatus?: boolean;
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
  const statusLabel = isLoadingStatus
    ? "Loading..."
    : applicationStatus ?? "—";
  const statusHighlight =
    !isLoadingStatus &&
    (applicationStatus === "Pending" || !applicationStatus);

  return (
    <main className="min-h-screen bg-[#F8FBFF] px-4 py-10 sm:py-16">
      <div className="mx-auto w-full max-w-2xl">
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_8px_28px_rgba(11,31,58,0.06)]">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#0B1F3A] to-[#102A56] px-6 py-8 text-center sm:px-8">
            <div className="pointer-events-none absolute -right-10 top-0 h-32 w-32 rounded-full bg-[#2563EB]/30 blur-3xl" />
            <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/20 ring-4 ring-emerald-400/20">
              <CheckCircle2 className="h-8 w-8 text-emerald-300" />
            </div>
            <h1 className="relative mt-4 text-2xl font-bold text-white">
              Application Submitted Successfully
            </h1>
            <p className="relative mt-2 text-sm text-white/70">
              Your application has been received and is awaiting review.
            </p>
          </div>

          <div className="px-6 py-6 sm:px-8">
            <div className="rounded-xl border border-slate-200/90 bg-[#F8FBFF] p-5">
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Application Status
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <StatusItem
                  label="Status"
                  value={statusLabel}
                  highlight={statusHighlight}
                />
                <StatusItem
                  label="Resume"
                  value={resumeSubmitted ? "Submitted" : "Not uploaded"}
                />
                <StatusItem
                  label="Application Number"
                  value={applicationNumber}
                  mono
                />
                {studentId ? (
                  <StatusItem label="Student ID" value={studentId} mono />
                ) : null}
                <StatusItem label="Student Name" value={studentName || "—"} />
                <StatusItem label="Applied For" value={jobTitle} />
                <StatusItem label="Company" value={companyName} />
                {dateLabel ? (
                  <StatusItem label="Applied Date" value={dateLabel} />
                ) : null}
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
              <div className="flex gap-3">
                <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                <div>
                  <p className="text-sm font-semibold text-emerald-900">
                    What happens next?
                  </p>
                  <p className="mt-1 text-sm text-emerald-800">
                    Our recruitment team will review your application. If you are
                    shortlisted, we will contact you with interview and update
                    details.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/jobs"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-[#0B1F3A] transition hover:border-[#2563EB]/30 hover:text-[#2563EB]"
              >
                Browse More Jobs
              </Link>
              {slug ? (
                <Link
                  href={`/jobs/${slug}`}
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#2F6BE5] to-[#1E49A8] px-5 text-sm font-semibold text-white transition hover:from-[#2860D4] hover:to-[#1A3F96]"
                >
                  View Job Details
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function StatusItem({
  label,
  value,
  mono = false,
  highlight = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p
        className={`mt-1 text-sm ${
          highlight
            ? "font-semibold text-amber-700"
            : mono
              ? "font-mono font-semibold text-[#2563EB]"
              : "font-medium text-[#0B1F3A]"
        }`}
      >
        {value || "—"}
      </p>
    </div>
  );
}
