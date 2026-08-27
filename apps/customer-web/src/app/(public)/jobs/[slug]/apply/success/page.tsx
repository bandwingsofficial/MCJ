"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { Loader } from "@/src/shared/components/ui/loader";
import { PublicJobApplySuccess } from "@/src/features/jobs/pages/PublicJobApplyPage";

function SuccessContent() {
  const searchParams = useSearchParams();
  const applicationNumber = searchParams.get("number") ?? "";
  const jobTitle = searchParams.get("title") ?? "this position";
  const appliedAt = searchParams.get("date") ?? undefined;

  if (!applicationNumber) {
    return (
      <div className="px-4 py-16 text-center text-[#647A9B]">
        Application details were not found.
      </div>
    );
  }

  return (
    <PublicJobApplySuccess
      jobTitle={jobTitle}
      applicationNumber={applicationNumber}
      appliedAt={appliedAt}
    />
  );
}

export default function PublicJobApplySuccessPage() {
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
