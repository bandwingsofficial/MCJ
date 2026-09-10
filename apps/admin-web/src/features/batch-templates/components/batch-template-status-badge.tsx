import { Badge } from "@/src/shared/components/ui/badge";

interface Props {
  isActive: boolean;
  isDeleted?: boolean;
}

export function BatchTemplateStatusBadge({
  isActive,
  isDeleted = false,
}: Props) {
  const compactClass = "px-2 py-0 text-[11px] font-semibold leading-5";

  if (isDeleted) {
    return (
      <Badge variant="danger" className={compactClass}>
        Archived
      </Badge>
    );
  }

  if (isActive) {
    return (
      <Badge variant="success" className={compactClass}>
        Active
      </Badge>
    );
  }

  return (
    <Badge variant="danger" className={compactClass}>
      Inactive
    </Badge>
  );
}
