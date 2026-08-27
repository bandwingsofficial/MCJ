export default function JobApplicationsPage() {
  return (
    <div>
      <h1 className="text-[30px] font-bold tracking-tight text-[#102A56]">
        Job Applications
      </h1>

      <p className="mt-2 text-[#647A9B]">
        Review and manage student job applications, application statuses,
        interview schedules, shortlisted candidates, and placement records.
      </p>

      <div className="mt-6 rounded-2xl border border-dashed border-[#DCE8F5] bg-white p-8 text-center">
        <p className="text-lg font-medium text-[#102A56]">
          Job Applications Management
        </p>

        <p className="mt-2 text-[#647A9B]">
          This module will enable administrators to monitor applications,
          review candidate profiles, schedule interviews, update application
          statuses, and manage placement activities.
        </p>
      </div>
    </div>
  );
}
