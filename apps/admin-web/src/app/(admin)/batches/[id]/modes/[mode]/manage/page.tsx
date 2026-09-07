import { BatchModeManagePage } from "@/src/features/batches/pages/batch-mode-manage-page";
import { parseBatchModeParam } from "@/src/features/batches/utils/batch-manage.routes";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string; mode: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id, mode: modeParam } = await params;
  const mode = parseBatchModeParam(modeParam);

  if (!mode) {
    notFound();
  }

  return <BatchModeManagePage batchId={id} mode={mode} />;
}
