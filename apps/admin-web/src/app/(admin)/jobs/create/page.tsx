export default function CreateJobPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Create Job</h1>

      <p className="mt-2 text-gray-600">
        Create and publish new job opportunities, internships, campus drives,
        and placement openings for students.
      </p>

      <div className="mt-6 rounded-lg border border-dashed border-gray-300 p-8 text-center">
        <p className="text-lg font-medium text-gray-700">
          Create Job Posting
        </p>

        <p className="mt-2 text-gray-500">
          The job creation module will allow administrators to define job
          details, company information, eligibility criteria, salary package,
          application deadlines, and publish opportunities for students.
        </p>
      </div>
    </div>
  );
}