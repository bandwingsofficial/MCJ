import { Badge } from "@/src/shared/components/ui/badge";

import type { CommunityManagementStatus } from "@/src/features/community/types/community.types";

interface Props {
  status: CommunityManagementStatus;
}

export function CommunityStatusBadge({ status }: Props) {
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
