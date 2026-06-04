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
        <Badge variant="success">
          Active
        </Badge>
      );

    case "INACTIVE":
      return (
        <Badge variant="warning">
          Inactive
        </Badge>
      );

    case "ARCHIVED":
      return (
        <Badge variant="danger">
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