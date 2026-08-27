"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { JobForm } from "@/src/features/jobs/components/JobForm";
import { jobService } from "@/src/features/jobs/services/job.service";
import type {
  CompanyJobSubmitResult,
  CreateJobRequest,
} from "@/src/features/jobs/types/job.types";

export function CompanyJobOnboardingPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [result, setResult] = useState<CompanyJobSubmitResult | null>(null);

  const handleSubmit = async (
    values: CreateJobRequest,
    image: File | null,
  ) => {
    try {
      setIsSubmitting(true);
      setFormError(null);
      const submitted = await jobService.submitCompanyJob(values, image);
      setResult(submitted);
    } catch (error) {
      setFormError(
        getErrorMessage(error) ||
          "Unable to submit your hiring requirement. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitAnother = () => {
    setResult(null);
    setFormError(null);
    setFormKey((value) => value + 1);
  };

  if (result) {
    const submittedOn = new Date(result.createdAt).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-12">
        <div className="rounded-2xl border border-[#DCE8F5] bg-white px-6 py-10 text-center shadow-[0_8px_24px_rgba(16,42,86,0.06)] sm:px-10">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#102A56]">
            Requirement Submitted Successfully
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#647A9B]">
            Thank you. Your hiring requirement has been submitted to MCJ
            Institute and is currently under review.
          </p>

          <dl className="mx-auto mt-8 grid max-w-md grid-cols-1 gap-3 text-left sm:grid-cols-2">
            <div className="rounded-xl border border-[#E8F1FF] bg-[#F8FBFF] px-4 py-3">
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
                Company Name
              </dt>
              <dd className="mt-1 text-sm font-semibold text-[#102A56]">
                {result.companyName}
              </dd>
            </div>
            <div className="rounded-xl border border-[#E8F1FF] bg-[#F8FBFF] px-4 py-3">
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
                Job Title
              </dt>
              <dd className="mt-1 text-sm font-semibold text-[#102A56]">
                {result.title}
              </dd>
            </div>
            <div className="rounded-xl border border-[#E8F1FF] bg-[#F8FBFF] px-4 py-3">
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
                Submission Date
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
            <div className="rounded-xl border border-[#E8F1FF] bg-[#F8FBFF] px-4 py-3 sm:col-span-2">
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
                Request ID
              </dt>
              <dd className="mt-1 break-all text-sm font-semibold text-[#102A56]">
                {result.id}
              </dd>
            </div>
          </dl>

          <Button
            type="button"
            className="mt-8 h-12 w-full sm:w-auto sm:px-8"
            onClick={submitAnother}
          >
            Submit Another Requirement
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:py-8">
      <section className="mb-5 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-[#102A56]">
          Submit Your Hiring Requirement
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-[#647A9B]">
          Share your hiring requirements with MCJ Institute. Our team will
          review your submission before publishing the job.
        </p>
      </section>

      <div className="rounded-2xl border border-[#DCE8F5] bg-white p-4 shadow-[0_8px_24px_rgba(16,42,86,0.06)] sm:p-6">
        <JobForm
          key={formKey}
          formId="company-job-form"
          variant="company"
          companyNameDefault=""
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
        />

        {formError ? (
          <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
            {formError}
          </p>
        ) : null}

        <div className="sticky bottom-0 mt-5 border-t border-[#E8F1FF] bg-white pt-4">
          <Button
            type="submit"
            form="company-job-form"
            className="h-12 w-full"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Hiring Requirement"}
          </Button>
        </div>
      </div>
    </div>
  );
}
