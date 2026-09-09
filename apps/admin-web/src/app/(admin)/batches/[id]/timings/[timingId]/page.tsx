import { BatchTimingManagePage } from "@/src/features/batches/pages/batch-timing-manage-page";

interface Props {
  params: Promise<{ id: string; timingId: string }>;
}

export default async function BatchTimingManageRoute({ params }: Props) {
  const { id, timingId } = await params;

  return <BatchTimingManagePage batchId={id} timingId={timingId} />;
}
