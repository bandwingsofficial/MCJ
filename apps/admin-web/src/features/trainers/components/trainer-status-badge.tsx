import { Badge } from "@/src/shared/components/ui/badge";

import type { TrainerDisplayStatus } from "@/src/features/trainers/types/trainer.types";

interface Props {
  status: TrainerDisplayStatus;
}

export function TrainerStatusBadge({ status }: Props) {
  switch (status) {
    case "ACTIVE":
      return (
        <Badge variant="success" className="px-2.5 py-0.5 text-sm">
          Active
        </Badge>
      );
    case "INACTIVE":
      return (
        <Badge variant="danger" className="px-2.5 py-0.5 text-sm">
          Inactive
        </Badge>
      );
    case "ARCHIVED":
      return (
        <Badge variant="danger" className="px-2.5 py-0.5 text-sm">
          Archived
        </Badge>
      );
    default:
      return (
        <Badge variant="default" className="px-2.5 py-0.5 text-sm">
          Unknown
        </Badge>
      );
  }
}
