"use client";

import { Modal } from "@/src/shared/components/ui/model";

import { CreateEnrollmentForm } from "@/src/features/enrollments/components/form/CreateEnrollmentForm";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateEnrollmentModal({ open, onClose, onSuccess }: Props) {
  return (
    <Modal open={open} title="Create Enrollment" onClose={onClose}>
      <CreateEnrollmentForm
        key={open ? "create-enrollment-open" : "create-enrollment-closed"}
        mode="create"
        onCancel={onClose}
        onSuccess={() => {
          onSuccess();
          onClose();
        }}
      />
    </Modal>
  );
}
