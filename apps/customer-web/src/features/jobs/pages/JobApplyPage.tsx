"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock3,
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

export function JobApplyPage({ slug }: JobApplyPageProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
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
    defaultValues: {
      firstName: "",
      lastName: "",
      email: user?.email ?? "",
      phone: "",
      gender: "MALE",
      dateOfBirth: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      country: "India",
      postalCode: "",
      qualification: "",
      collegeName: "",
      specialization: "",
      passingYear: new Date().getFullYear(),
    },
  });

  const {
    register,
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = form;

  useEffect(() => {
    if (user?.email) {
      setValue("email", user.email);
    }
  }, [setValue, user?.email]);

  const acceptingApplications = useMemo(
    () => (job ? isJobAcceptingApplications(job) : false),
    [job],
  );

  const visibleResumeError =
    resumeTouched || form.formState.isSubmitted ? resumeError : null;

  if (!authReady || !isAuthenticated) {
    return (
      <div className="flex justify-center py-20">
        <Loader />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="px-4 py-16">
        <ErrorState
          title="Unable to load job"
          description={getErrorMessage(error) || "This job could not be found."}
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="bg-[#F4F8FD] px-4 py-8 sm:py-10">
      <div className="mx-auto w-full max-w-4xl">
        <Link
          href={`/jobs/${slug}`}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#2563D9] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Job Details
        </Link>

        <section className="mb-6 rounded-2xl border border-[#DCE8F5] bg-white p-5 shadow-[0_8px_24px_rgba(16,42,86,0.06)] sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#647A9B]">
            Apply for this role
          </p>
          <h1 className="mt-2 text-2xl font-bold text-[#102A56]">{job.title}</h1>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-[#647A9B]">
            <span className="inline-flex items-center gap-1.5">
              <Building2 className="h-4 w-4" />
              {job.companyName}
            </span>
            {job.location ? (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {job.location}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1.5">
              <Briefcase className="h-4 w-4" />
              {employmentLabel(job.employmentType)}
            </span>
            {salaryLabel(job) ? (
              <span className="inline-flex items-center gap-1.5">
                {salaryLabel(job)}
              </span>
            ) : null}
          </div>
        </section>

        {acceptingApplications ? (
          <section className="rounded-2xl border border-[#DCE8F5] bg-white p-5 shadow-[0_8px_24px_rgba(16,42,86,0.06)] sm:p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-[#102A56]">
                Application Form
              </h2>
              <p className="mt-1 text-sm text-[#647A9B]">
                Complete your student details and upload your resume to apply.
              </p>
            </div>

            <form
              className="space-y-6"
              onSubmit={handleSubmit(async (values) => {
                setFormError(null);
                setResumeTouched(true);
                const nextResumeError = validateJobApplicationResumeFile(resume);
                setResumeError(nextResumeError);

                if (nextResumeError || !resume) {
                  return;
                }

                try {
                  setIsSubmitting(true);
                  const result = await jobService.applyWithStudent(
                    slug,
                    values,
                    resume,
                  );

                  const params = new URLSearchParams({
                    number: result.applicationNumber,
                    title: result.job?.title ?? job.title,
                    company: result.job?.companyName ?? job.companyName,
                    date: result.createdAt,
                    slug,
                    studentId:
                      result.student?.studentCode ?? result.studentId ?? "",
                    studentName: [
                      result.student?.firstName,
                      result.student?.lastName,
                    ]
                      .filter(Boolean)
                      .join(" ")
                      .trim(),
                    resume: result.resumeFileId ? "yes" : "no",
                  });

                  router.push(
                    `/jobs/${slug}/apply/success?${params.toString()}`,
                  );
                } catch (submitError) {
                  setFormError(
                    getErrorMessage(submitError) ||
                      "Unable to submit your application.",
                  );
                } finally {
                  setIsSubmitting(false);
                }
              })}
            >
              {[
                {
                  title: "Personal Information",
                  content: (
                    <div className="grid gap-4 md:grid-cols-2">
                      {[
                        { label: "First Name", id: "firstName", required: true },
                        { label: "Last Name", id: "lastName", required: false },
                        { label: "Email", id: "email", required: true },
                        { label: "Phone Number", id: "phone", required: true },
                      ].map((field) => (
                        <div key={field.id}>
                          <Label required={field.required}>{field.label}</Label>
                          <Input
                            {...register(
                              field.id as keyof JobApplicationStudentFormValues,
                            )}
                            placeholder={`Enter ${field.label.toLowerCase()}`}
                          />
                          <FormError
                            message={
                              errors[
                                field.id as keyof JobApplicationStudentFormValues
                              ]?.message
                            }
                          />
                        </div>
                      ))}
                      <div>
                        <Label required>Gender</Label>
                        <AppSelect
                          value={watch("gender")}
                          options={GENDER_OPTIONS}
                          onValueChange={(value) =>
                            setValue("gender", value as "MALE" | "FEMALE" | "OTHER", {
                              shouldValidate: true,
                            })
                          }
                        />
                        <FormError message={errors.gender?.message} />
                      </div>
                      <div>
                        <Label required>Date of Birth</Label>
                        <Input type="date" {...register("dateOfBirth")} />
                        <FormError message={errors.dateOfBirth?.message} />
                      </div>
                    </div>
                  ),
                },
                {
                  title: "Address Information",
                  content: (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="md:col-span-2">
                        <Label required>Address Line 1</Label>
                        <Input {...register("addressLine1")} />
                        <FormError message={errors.addressLine1?.message} />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Address Line 2</Label>
                        <Input {...register("addressLine2")} />
                        <FormError message={errors.addressLine2?.message} />
                      </div>
                      {(["city", "state", "country", "postalCode"] as const).map(
                        (field) => (
                          <div key={field}>
                            <Label required>
                              {field.charAt(0).toUpperCase() + field.slice(1)}
                            </Label>
                            <Input {...register(field)} />
                            <FormError message={errors[field]?.message} />
                          </div>
                        ),
                      )}
                    </div>
                  ),
                },
                {
                  title: "Education Details",
                  content: (
                    <div className="grid gap-4 md:grid-cols-2">
                      {(
                        [
                          "qualification",
                          "collegeName",
                          "specialization",
                          "passingYear",
                        ] as const
                      ).map((field) => (
                        <div key={field}>
                          <Label required>
                            {field
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (char) => char.toUpperCase())}
                          </Label>
                          <Input
                            type={field === "passingYear" ? "number" : "text"}
                            {...register(field, {
                              valueAsNumber: field === "passingYear",
                            })}
                          />
                          <FormError message={errors[field]?.message} />
                        </div>
                      ))}
                    </div>
                  ),
                },
              ].map((section) => (
                <section key={section.title} className="space-y-3">
                  <h3 className="border-b pb-1 text-base font-semibold text-[#102A56]">
                    {section.title}
                  </h3>
                  {section.content}
                </section>
              ))}

              <section className="space-y-3">
                <h3 className="border-b pb-1 text-base font-semibold text-[#102A56]">
                  Resume
                </h3>
                <p className="text-sm text-[#647A9B]">
                  Upload your resume in PDF format only.
                </p>
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
              </section>

              {formError ? (
                <p role="alert" className="text-sm text-red-500">
                  {formError}
                </p>
              ) : null}

              <div className="flex justify-end border-t pt-4">
                <Button
                  type="submit"
                  className="h-[46px] bg-gradient-to-r from-[#2563D9] to-[#1746A2] px-6 hover:from-[#1E58C7] hover:to-[#123D94]"
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

export function JobApplySuccess({
  jobTitle,
  companyName,
  applicationNumber,
  studentId,
  studentName,
  appliedAt,
  resumeSubmitted,
  slug,
}: {
  jobTitle: string;
  companyName: string;
  applicationNumber: string;
  studentId: string;
  studentName: string;
  appliedAt?: string;
  resumeSubmitted: boolean;
  slug?: string;
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
    <div className="bg-[#F4F8FD] px-4 py-10 sm:py-16">
      <div className="mx-auto w-full max-w-2xl">
        <div className="rounded-2xl border border-[#DCE8F5] bg-white px-6 py-10 shadow-[0_8px_24px_rgba(16,42,86,0.06)] sm:px-8">
          <div className="text-center">
            <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" />
            <h1 className="mt-4 text-2xl font-bold text-[#102A56]">
              Application Submitted Successfully
            </h1>
            <p className="mt-3 text-sm text-[#647A9B]">
              Your application has been received and is awaiting review.
            </p>
          </div>

          <div className="mt-8 rounded-xl border border-[#DCE8F5] bg-[#F8FBFF] p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[#647A9B]">
              Application Status
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <StatusItem label="Status" value="Pending" highlight />
              <StatusItem
                label="Resume"
                value={resumeSubmitted ? "Submitted" : "Not uploaded"}
              />
              <StatusItem label="Application Number" value={applicationNumber} mono />
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

          <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
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
              className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium hover:bg-slate-50"
            >
              Browse More Jobs
            </Link>
            {slug ? (
              <Link
                href={`/jobs/${slug}`}
                className="inline-flex h-11 items-center justify-center rounded-md bg-gradient-to-r from-[#2563D9] to-[#1746A2] px-4 text-sm font-medium text-white hover:from-[#1E58C7] hover:to-[#123D94]"
              >
                View Job Details
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
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
      <p className="text-xs uppercase tracking-wide text-[#647A9B]">{label}</p>
      <p
        className={`mt-1 text-sm ${
          highlight
            ? "font-semibold text-amber-700"
            : mono
              ? "font-mono font-semibold text-[#2563D9]"
              : "font-medium text-[#102A56]"
        }`}
      >
        {value || "—"}
      </p>
    </div>
  );
}
