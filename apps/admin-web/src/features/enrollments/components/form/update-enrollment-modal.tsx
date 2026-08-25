"use client";

import { Modal } from "@/src/shared/components/ui/model";
import { Skeleton } from "@/src/shared/components/ui/skeleton";

import { CreateEnrollmentForm } from "@/src/features/enrollments/components/form/CreateEnrollmentForm";
import type { Enrollment } from "@/src/features/enrollments/types";

interface Props {
  open: boolean;
  enrollment: Enrollment | null;
  isLoading?: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function UpdateEnrollmentModal({
  open,
  enrollment,
  isLoading = false,
  onClose,
  onSuccess,
}: Props) {
  return (
    <Modal open={open} title="Edit Enrollment" onClose={onClose}>
      {isLoading || !enrollment ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      ) : (
        <CreateEnrollmentForm
          key={enrollment.id}
          mode="edit"
          enrollment={enrollment}
          onCancel={onClose}
          onSuccess={() => {
            onSuccess();
            onClose();
          }}
        />
      )}
    </Modal>
  );
}
