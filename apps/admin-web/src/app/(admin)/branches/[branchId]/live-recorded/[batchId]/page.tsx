import { BranchLiveRecordedBatchPage } from "@/src/features/branches/pages/branch-live-recorded-batch-page";

interface Props {
  params: Promise<{
    branchId: string;
    batchId: string;
  }>;
}

export default async function BranchLiveRecordedBatchRoute({ params }: Props) {
  const { branchId, batchId } = await params;

  return (
    <BranchLiveRecordedBatchPage branchId={branchId} batchId={batchId} />
  );
}
