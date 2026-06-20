import {
  ApplyJobPage,
} from "@/src/features/student-jobs/pages";

interface ApplyJobRouteProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ApplyJobRoute({
  params,
}: ApplyJobRouteProps) {
  const { id } = await params;

  return (
    <ApplyJobPage
      jobId={id}
      jobSlug={id}
    />
  );
}