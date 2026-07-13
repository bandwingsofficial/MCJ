import { TrainerDetailsPage } from "@/src/features/trainers/pages/TrainerDetailsPage";

interface TrainerDetailsRouteProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TrainerDetailsRoute({
  params,
}: TrainerDetailsRouteProps) {
  const { id } = await params;

  return (
    <TrainerDetailsPage
      trainerId={id}
    />
  );
}