import { BatchDetailsPage } from "@/src/features/batches/pages/BatchDetailsPage";

interface BatchDetailsRouteProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function BatchPageRoute({
  params,
}: BatchDetailsRouteProps) {
  const { id } = await params;

  return (
    <BatchDetailsPage
      id={id}
    />
  );
}