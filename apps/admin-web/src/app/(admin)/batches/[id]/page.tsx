import { BatchManagePage } from "@/src/features/batches/pages/batch-manage-page";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function BatchManageRoute({ params }: Props) {
  const { id } = await params;

  return <BatchManagePage batchId={id} />;
}
