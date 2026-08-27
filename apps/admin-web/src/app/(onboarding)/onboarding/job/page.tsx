import type { Metadata } from "next";

import { CompanyJobOnboardingPage } from "@/src/features/jobs/pages/CompanyJobOnboardingPage";

export const metadata: Metadata = {
  title: "Submit Your Hiring Requirement | MCJ Institute",
  description:
    "Share your hiring requirements with MCJ Institute. Our team will review your submission before publishing the job.",
};

export default function CompanyJobOnboardingRoute() {
  return <CompanyJobOnboardingPage />;
}
