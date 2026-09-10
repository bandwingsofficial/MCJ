import { Badge } from "@/src/shared/components/ui/badge";

import type { TrainerDisplayStatus } from "@/src/features/trainers/types/trainer.types";

interface Props {
  status: TrainerDisplayStatus;
}

export function TrainerStatusBadge({ status }: Props) {
  const compactClass = "px-2 py-0 text-[11px] font-semibold leading-5";

  switch (status) {
    case "ACTIVE":
      return (
        <Badge variant="success" className={compactClass}>
          Active
        </Badge>
      );
    case "INACTIVE":
      return (
        <Badge variant="danger" className={compactClass}>
          Inactive
        </Badge>
      );
    case "ARCHIVED":
      return (
        <Badge variant="danger" className={compactClass}>
          Archived
        </Badge>
      );
    default:
      return (
        <Badge variant="default" className={compactClass}>
          Unknown
        </Badge>
      );
  }
}
