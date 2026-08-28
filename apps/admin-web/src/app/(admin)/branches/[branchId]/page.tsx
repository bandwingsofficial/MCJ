import { BranchManagePage } from "@/src/features/branches/pages/branch-manage-page";

interface Props {
  params: Promise<{
    branchId: string;
  }>;
}

export default async function BranchManageRoute({ params }: Props) {
  const { branchId } = await params;

  return <BranchManagePage branchId={branchId} />;
}
