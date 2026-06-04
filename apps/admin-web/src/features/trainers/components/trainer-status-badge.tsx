import { Badge } from "@/src/shared/components/ui/badge";

import type {
  TrainerStatus,
} from "@/src/features/trainers/types/trainer.types";

interface Props {
  status: TrainerStatus;
}

export function TrainerStatusBadge({
  status,
}: Props) {
  if (
    status === "ACTIVE"
  ) {
    return (
      <Badge variant="success">
        Active
      </Badge>
    );
  }

  return (
    <Badge variant="danger">
      Inactive
    </Badge>
  );
}