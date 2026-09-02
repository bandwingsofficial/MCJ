"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Loader } from "@/src/shared/components/ui/loader";

import { JobApplyClosedState } from "@/src/features/jobs/components/public-job-apply/job-apply-closed-state";
import { JobApplyForm } from "@/src/features/jobs/components/public-job-apply/job-apply-form";
import { JobApplySuccess } from "@/src/features/jobs/components/public-job-apply/job-apply-success";
import { JobApplySummary } from "@/src/features/jobs/components/public-job-apply/job-apply-summary";
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
  getApiCode,
  mapApplicationSubmitError,
} from "@/src/features/jobs/utils/public-job-apply.utils";
import { getErrorMessage, getErrorStatus } from "@/src/core/utils/get-error-message";

interface PublicJobApplyPageProps {
  slug: string;
}

type ClosedReason = "not-found" | "inactive" | "expired";

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

export function PublicJobApplyPage({ slug }: PublicJobApplyPageProps) {
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [resume, setResume] = useState<File | null>(null);
  const [resumeTouched, setResumeTouched] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [declarationTouched, setDeclarationTouched] = useState(false);
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
    },
  });

  const showValidation = isSubmitted;

  const visibleResumeError = useMemo(() => {
    if (!(resumeTouched || showValidation)) {
      return null;
    }
    return resumeError ?? validateResumeFile(resume);
  }, [resume, resumeError, resumeTouched, showValidation]);

  const declarationError = declarationAccepted
    ? null
    : "Please confirm the declaration before submitting.";

  const submit = handleSubmit(
    async (formValues) => {
      setDeclarationTouched(true);

      const fileError = validateResumeFile(resume);
      setResumeTouched(true);
      setResumeError(fileError);

      if (!declarationAccepted) {
        return;
      }

      if (fileError || !resume) {
        return;
      }

      if (isSubmitting) {
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
        formData.append(
          "yearsOfExperience",
          String(formValues.yearsOfExperience),
        );

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
        setFormError(mapApplicationSubmitError(error));
      } finally {
        setIsSubmitting(false);
      }
    },
    () => {
      setDeclarationTouched(true);
      setResumeTouched(true);
    },
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader />
      </div>
    );
  }

  if (result) {
    return <JobApplySuccess result={result} job={job} />;
  }

  const closedReason = resolveClosedReason(job, loadError);

  if (!job || closedReason === "not-found") {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16">
        <JobApplyClosedState
          title="Job Not Found"
          description="This job is not available or is no longer publicly listed."
        />
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
      ? "Applications for this job are closed. The application deadline has passed."
      : "This position is currently not accepting applications.";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-8">
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(280px,320px)_1fr] lg:gap-6">
        <aside className="lg:sticky lg:top-6">
          <JobApplySummary job={job} />
        </aside>

        <div className="min-w-0">
          {!accepting ? (
            <JobApplyClosedState
              title={closedTitle}
              description={closedCopy}
            />
          ) : (
            <JobApplyForm
              register={register}
              control={control}
              errors={errors}
              watch={watch}
              touchedFieldNames={
                touchedFields as Partial<
                  Record<
                    keyof PublicJobApplicationFormValues,
                    boolean | undefined
                  >
                >
              }
              showValidation={showValidation}
              isSubmitting={isSubmitting}
              formError={formError}
              resume={resume}
              visibleResumeError={visibleResumeError}
              declarationAccepted={declarationAccepted}
              declarationTouched={declarationTouched}
              declarationError={declarationError}
              onDeclarationChange={(accepted) => {
                setDeclarationAccepted(accepted);
                setDeclarationTouched(true);
              }}
              onResumeSelect={(file) => {
                setResumeTouched(true);
                setResume(file);
                setResumeError(validateResumeFile(file));
              }}
              onSubmit={() => {
                void submit();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
