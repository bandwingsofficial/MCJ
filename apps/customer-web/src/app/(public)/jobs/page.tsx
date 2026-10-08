import type { Metadata } from "next";

import { JobsPage } from "@/src/features/jobs/pages/JobsPage";

export const metadata: Metadata = {
  title: "Accounting & Finance Jobs | Career Opportunities | MCJ Academy",
  description:
    "Explore accounting, finance and career opportunities through MCJ Academy. Discover job openings and opportunities to grow your professional career.",
};

export default function JobsRoutePage() {
  return <JobsPage />;
}