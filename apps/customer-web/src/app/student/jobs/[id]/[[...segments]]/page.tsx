import { notFound } from "next/navigation";

import { ApplyJobPage } from "@/src/features/student-jobs/pages";

interface Props {
  params: Promise<{
    id: string;
    segments?: string[];
  }>;
}

export default async function Page({ params }: Props) {
  const { id, segments = [] } = await params;

  if (segments.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Job Details</h1>
        <p className="mt-2 text-gray-600">
          View complete information about this job opportunity, eligibility,
          company details, application deadline, and current application status.
        </p>
        <div className="mt-6 rounded-lg border border-dashed border-gray-300 p-8 text-center">
          <p className="text-lg font-medium text-gray-700">Job ID: {id}</p>
          <p className="mt-2 text-gray-500">
            This page will display complete job details once the feature is
            implemented.
          </p>
        </div>
      </div>
    );
  }

  if (segments.length === 1 && segments[0] === "apply") {
    return <ApplyJobPage jobId={id} jobSlug={id} />;
  }

  notFound();
}
