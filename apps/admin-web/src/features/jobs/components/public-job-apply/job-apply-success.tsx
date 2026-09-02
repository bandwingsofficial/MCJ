import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import type {
  Job,
  PublicJobApplicationResult,
} from "@/src/features/jobs/types/job.types";

interface JobApplySuccessProps {
  result: PublicJobApplicationResult;
  job: Job | null;
}

export function JobApplySuccess({ result, job }: JobApplySuccessProps) {
  const submittedOn = new Date(result.createdAt).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-10 sm:py-12">
      <div className="rounded-2xl border border-[#DCE8F5] bg-white px-6 py-10 text-center shadow-[0_8px_24px_rgba(16,42,86,0.06)] sm:px-10">
        <CheckCircle2
          className="mx-auto h-12 w-12 text-emerald-600"
          aria-hidden
        />
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#102A56]">
          Application Submitted Successfully
        </h1>
        <p className="mt-2 text-sm text-[#647A9B]">
          Your application has been received and is pending review.
        </p>

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

        <p className="mx-auto mt-6 max-w-sm text-sm text-[#647A9B]">
          Please save your application number for future reference. Our team
          will contact you if your profile is shortlisted.
        </p>

        <Link
          href="/"
          className="mt-8 inline-flex h-11 items-center justify-center rounded-xl border border-[#DCE8F5] bg-white px-6 text-sm font-medium text-[#102A56] transition-colors hover:bg-[#F8FBFF]"
        >
          Back to Jobs
        </Link>
      </div>
    </div>
  );
}
