import { Badge } from "@/src/shared/components/ui/badge";

import type {
  CategoryStatus,
} from "@/src/features/categories/types/category.types";

interface Props {
  status: CategoryStatus;
}

export function CategoryStatusBadge({
  status,
}: Props) {
  switch (status) {
    case "ACTIVE":
      return (
        <Badge
          variant="success"
          className="px-2.5 py-0.5 text-sm"
        >
          Active
        </Badge>
      );

    case "INACTIVE":
      return (
        <Badge
          variant="warning"
          className="px-2.5 py-0.5 text-sm"
        >
          Inactive
        </Badge>
      );

    case "ARCHIVED":
      return (
        <Badge
          variant="danger"
          className="px-2.5 py-0.5 text-sm"
        >
          Archived
        </Badge>
      );

    default:
      return (
        <Badge>
          Unknown
        </Badge>
      );
  }
}