"use client";

import { Badge } from "@/src/shared/components/ui/badge";

import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";

function isArchivedEnrollment(enrollment: Enrollment): boolean {
  return Boolean(enrollment.isDeleted || enrollment.deletedAt);
}

interface Props {
  enrollment: Enrollment;
}

export function StudentEnrollmentActiveBadge({ enrollment }: Props) {
  if (isArchivedEnrollment(enrollment)) {
    return (
      <Badge variant="danger" className="px-2.5 py-0.5 text-sm">
        Archived
      </Badge>
    );
  }

  if (enrollment.isActive === false) {
    return (
      <Badge variant="danger" className="px-2.5 py-0.5 text-sm">
        Inactive
      </Badge>
    );
  }

  return (
    <Badge variant="success" className="px-2.5 py-0.5 text-sm">
      Active
    </Badge>
  );
}
