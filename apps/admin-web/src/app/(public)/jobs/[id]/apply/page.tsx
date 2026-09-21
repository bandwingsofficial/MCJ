import type { Metadata } from "next";

import { PublicJobApplyPage } from "@/src/features/jobs/pages/PublicJobApplyPage";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export const metadata: Metadata = {
  title: "Apply for this Job | MCJ Academy",
  description: "Submit your application to MCJ Academy.",
};

export default async function PublicJobApplyRoute({ params }: Props) {
  const { id: slug } = await params;
  return <PublicJobApplyPage slug={slug} />;
}