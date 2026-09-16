import { notFound } from "next/navigation";

import { BranchDetailPage } from "@/src/features/branches/pages/branch-detail-page";
import { branchService } from "@/src/features/branches/services/branch.service";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function Page({ params }: Props) {
  const { slug } = await params;

  try {
    await branchService.getBranch(slug);
  } catch {
    notFound();
  }

  return <BranchDetailPage branchSlugOrId={slug} />;
}