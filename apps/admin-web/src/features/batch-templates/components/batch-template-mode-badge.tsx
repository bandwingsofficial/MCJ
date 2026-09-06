import { Badge } from "@/src/shared/components/ui/badge";

import type { BatchMode } from "@/src/features/batches/types/batch.types";

interface Props {
  mode: BatchMode;
}

export function BatchTemplateModeBadge({ mode }: Props) {
  switch (mode) {
    case "OFFLINE":
      return (
        <Badge variant="warning" className="px-2.5 py-0.5 text-sm">
          Offline / Classroom
        </Badge>
      );

    case "ONLINE":
      return (
        <Badge variant="success" className="px-2.5 py-0.5 text-sm">
          Online
        </Badge>
      );

    case "RECORDED":
      return (
        <Badge variant="info" className="px-2.5 py-0.5 text-sm">
          Self-Paced / Recorded
        </Badge>
      );

    default:
      return (
        <Badge className="px-2.5 py-0.5 text-sm">{mode}</Badge>
      );
  }
}
