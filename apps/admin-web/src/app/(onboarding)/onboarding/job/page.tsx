import type { Metadata } from "next";

import { CompanyJobOnboardingPage } from "@/src/features/jobs/pages/CompanyJobOnboardingPage";

export const metadata: Metadata = {
  title: "Job Onboarding",
  description:
    "Share your hiring requirements with MCJ Academy. Our team will review your submission before publishing the job.",
};

export default function CompanyJobOnboardingRoute() {
  return <CompanyJobOnboardingPage />;
}