import { notFound } from "next/navigation";

import { JobDetailsPage } from "@/src/features/jobs/pages/JobDetailsPage";
import { JobApplyPage } from "@/src/features/jobs/pages/JobApplyPage";
import { JobApplySuccessPage } from "@/src/features/jobs/pages/JobApplySuccessPage";

interface JobSlugRouteProps {
  params: Promise<{
    slug: string;
    segments?: string[];
  }>;
}

/** Handles `/jobs/:slug`, `/apply`, and `/apply/success`. */
export async function JobSlugRoutePage({ params }: JobSlugRouteProps) {
  const { slug, segments = [] } = await params;

  if (segments.length === 0) {
    return <JobDetailsPage slug={slug} />;
  }

  if (segments.length === 1 && segments[0] === "apply") {
    return <JobApplyPage slug={slug} />;
  }

  if (
    segments.length === 2 &&
    segments[0] === "apply" &&
    segments[1] === "success"
  ) {
    return <JobApplySuccessPage />;
  }

  notFound();
}
