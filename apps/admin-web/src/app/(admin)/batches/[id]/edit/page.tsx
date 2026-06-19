import { BatchEditPage } from "@/src/features/batches/pages/BatchEditPage";

interface BatchEditRouteProps {
  params: {
    id: string;
  };
}

export default function EditBatchRoute({
  params,
}: BatchEditRouteProps) {
  return (
    <BatchEditPage
      batchId={params.id}
    />
  );
}