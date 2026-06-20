import {
  JobApplicationDetailsPage,
} from "@/src/features/student-jobs/pages";

interface JobApplicationDetailsRouteProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function JobApplicationDetailsRoute({
  params,
}: JobApplicationDetailsRouteProps) {
  const { id } = await params;

  return (
    <JobApplicationDetailsPage
      applicationId={id}
    />
  );
}