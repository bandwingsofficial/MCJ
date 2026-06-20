import { JobDetailsPage } from "@/src/features/jobs/pages/JobDetailsPage";

interface JobPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function JobPage({
  params,
}: JobPageProps) {
  const { slug } =
    await params;

  return (
    <JobDetailsPage
      slug={slug}
    />
  );
}