"use client";

import { Modal } from "@/src/shared/components/ui/model";

import { BranchForm } from "./branch-form";

import {
  Branch,
  UpdateBranchRequest,
} from "@/src/features/branches/types/branch.types";

import { useUpdateBranch } from "@/src/features/branches/hooks/use-update-branch";

import { CreateBranchFormValues } from "@/src/features/branches/schemas/branch.schema";

interface UpdateBranchModalProps {
  open: boolean;

  branch: Branch | null;

  isLoading?: boolean;

  onClose: () => void;

  onSuccess: (updated: Branch) => void | Promise<void>;
}

function toUpdatePayload(
  values: CreateBranchFormValues
): UpdateBranchRequest {
  return {
    branchName: values.branchName.trim(),
    branchCode: values.branchCode.trim().toUpperCase(),
    email: values.email.trim(),
    phone: values.phone.trim(),
    addressLine1: values.addressLine1.trim(),
    addressLine2: values.addressLine2?.trim()
      ? values.addressLine2.trim()
      : undefined,
    city: values.city.trim(),
    state: values.state.trim(),
    country: values.country.trim(),
    postalCode: values.postalCode.trim(),
    latitude: Number(values.latitude),
    longitude: Number(values.longitude),
    description: values.description?.trim()
      ? values.description.trim()
      : undefined,
  };
}

export function UpdateBranchModal({
  open,
  branch,
  isLoading = false,
  onClose,
  onSuccess,
}: UpdateBranchModalProps) {
  const { updateBranch, isPending } = useUpdateBranch();

  if (!open) {
    return null;
  }

  const handleSubmit = async (
    values: CreateBranchFormValues
  ) => {
    if (!branch) {
      return;
    }

    const payload = toUpdatePayload(values);
    const updated = await updateBranch(branch.id, payload);
    try {
      await onSuccess(updated);
    } finally {
      onClose();
    }
  };

  return (
    <Modal open={open} title="Update Branch" onClose={onClose}>
      {isLoading || !branch ? (
        <p className="py-6 text-sm text-[#647A9B]">
          Loading branch details…
        </p>
      ) : (
        <BranchForm
          key={`${branch.id}-${branch.updatedAt}`}
          excludeId={branch.id}
          defaultValues={{
            branchName: branch.branchName,
            branchCode: branch.branchCode,
            email: branch.email ?? "",
            phone: branch.phone ?? "",
            addressLine1: branch.addressLine1 ?? "",
            addressLine2: branch.addressLine2 ?? "",
            city: branch.city ?? "",
            state: branch.state ?? "",
            country: branch.country ?? "",
            postalCode: branch.postalCode ?? "",
            latitude: branch.latitude ?? 0,
            longitude: branch.longitude ?? 0,
            description: branch.description ?? "",
          }}
          submitLabel="Update Branch"
          isSubmitting={isPending}
          onSubmit={handleSubmit}
        />
      )}
    </Modal>
  );
}
