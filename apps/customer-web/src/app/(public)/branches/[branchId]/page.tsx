import { BranchDetailPage } from "@/src/features/branches/pages/branch-detail-page";

interface Props {
  params: Promise<{ branchId: string }>;
}

export default async function Page({ params }: Props) {
  const { branchId } = await params;
  return <BranchDetailPage branchSlugOrId={branchId} />;
}
