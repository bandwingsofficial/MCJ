"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { Loader } from "@/src/shared/components/ui/loader";
import { JobApplySuccess } from "@/src/features/jobs/pages/JobApplyPage";

function SuccessContent() {
  const searchParams = useSearchParams();
  const applicationNumber = searchParams.get("number") ?? "";
  const jobTitle = searchParams.get("title") ?? "this position";
  const companyName = searchParams.get("company") ?? "—";
  const appliedAt = searchParams.get("date") ?? undefined;
  const studentId = searchParams.get("studentId") ?? "";
  const studentName = searchParams.get("studentName") ?? "";
  const resumeSubmitted = searchParams.get("resume") === "yes";
  const slug = searchParams.get("slug") ?? undefined;

  if (!applicationNumber) {
    return (
      <div className="px-4 py-16 text-center text-[#647A9B]">
        Application details were not found.
      </div>
    );
  }

  return (
    <JobApplySuccess
      jobTitle={jobTitle}
      companyName={companyName}
      applicationNumber={applicationNumber}
      studentId={studentId}
      studentName={studentName}
      appliedAt={appliedAt}
      resumeSubmitted={resumeSubmitted}
      slug={slug}
    />
  );
}

export default function JobApplySuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <Loader />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
