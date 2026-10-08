import type { Metadata } from "next";

import { BatchPage } from "@/src/features/batches/pages/Batchpage";

export const metadata: Metadata = {
  title: "Accounting & Tally Training Batches | MCJ Academy",
  description:
    "Explore upcoming accounting and Tally training batches at MCJ Academy. Choose from flexible schedules and practical courses designed to build job-ready skills.",
};

export default function BatchesPage() {
  return <BatchPage />;
}