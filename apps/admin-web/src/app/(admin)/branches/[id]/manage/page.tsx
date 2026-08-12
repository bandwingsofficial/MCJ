import { BranchManagePage } from "@/src/features/branches/pages/branch-manage-page";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;

  return <BranchManagePage branchId={id} />;
}
