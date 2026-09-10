import { BatchModeCalendarPage } from "@/src/features/batches/pages/batch-mode-calendar-page";

interface Props {
  params: Promise<{ id: string; mode: string }>;
}

export default async function BatchCalendarRoute({ params }: Props) {
  const { id, mode } = await params;

  return <BatchModeCalendarPage batchId={id} modeParam={mode} />;
}
