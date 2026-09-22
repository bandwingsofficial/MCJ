import { notFound } from "next/navigation";

interface JobSlugRouteProps {
  params: Promise<{
    slug: string;
    segments?: string[];
  }>;
}

/**
 * Handles `/jobs/:slug`, `/apply`, and `/apply/success`.
 * Branch pages are imported lazily so job details / apply (~840 LOC) /
 * success are not all compiled for every jobs deep URL.
 */
export async function JobSlugRoutePage({ params }: JobSlugRouteProps) {
  const { slug, segments = [] } = await params;

  if (segments.length === 0) {
    const { JobDetailsPage } = await import(
      "@/src/features/jobs/pages/JobDetailsPage"
    );
    return <JobDetailsPage slug={slug} />;
  }

  if (segments.length === 1 && segments[0] === "apply") {
    const { JobApplyPage } = await import(
      "@/src/features/jobs/pages/JobApplyPage"
    );
    return <JobApplyPage slug={slug} />;
  }

  if (
    segments.length === 2 &&
    segments[0] === "apply" &&
    segments[1] === "success"
  ) {
    const { JobApplySuccessPage } = await import(
      "@/src/features/jobs/pages/JobApplySuccessPage"
    );
    return <JobApplySuccessPage />;
  }

  notFound();
}
