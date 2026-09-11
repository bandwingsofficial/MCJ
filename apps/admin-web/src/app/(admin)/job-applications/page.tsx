import { Suspense } from "react";

import { JobApplicationsPage } from "@/src/features/job-applications/pages/job-applications-page";

export default function JobApplicationsRoutePage() {
  return (
    <Suspense fallback={null}>
      <JobApplicationsPage />
    </Suspense>
  );
}
