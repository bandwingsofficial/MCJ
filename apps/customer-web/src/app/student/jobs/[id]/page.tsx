interface JobDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function JobDetailsPage({
  params,
}: JobDetailsPageProps) {
  const { id } = await params;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">
        Job Details
      </h1>

      <p className="mt-2 text-gray-600">
        View complete information about this job opportunity, eligibility,
        company details, application deadline, and current application status.
      </p>

      <div className="mt-6 rounded-lg border border-dashed border-gray-300 p-8 text-center">
        <p className="text-lg font-medium text-gray-700">
          Job ID: {id}
        </p>

        <p className="mt-2 text-gray-500">
          This page will display complete job details once the feature is
          implemented.
        </p>
      </div>
    </div>
  );
}