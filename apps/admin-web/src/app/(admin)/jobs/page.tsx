import { Suspense } from "react";

import { JobsPage } from "@/src/features/jobs/pages/JobsPage";

export default function JobsRoutePage() {
  return (
    <Suspense fallback={null}>
      <JobsPage />
    </Suspense>
  );
}
