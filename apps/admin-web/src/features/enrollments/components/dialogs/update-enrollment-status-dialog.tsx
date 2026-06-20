"use client";

import { useState } from "react";

import { Button } from "@/src/shared/components/ui/button";
import { Modal } from "@/src/shared/components/ui/model";
import { AppSelect } from "@/src/shared/components/ui/select";
import { Label } from "@/src/shared/components/ui/label";

import {
  EnrollmentStatus,
} from "../../types";

import {
  ENROLLMENT_STATUS_OPTIONS,
} from "../../constants";

interface UpdateEnrollmentStatusDialogProps {
  open: boolean;

  value: EnrollmentStatus;

  loading?: boolean;

  onClose: () => void;

  onSubmit: (
    status: EnrollmentStatus,
  ) => void;
}

export function UpdateEnrollmentStatusDialog({
  open,
  value,
  loading,
  onClose,
  onSubmit,
}: UpdateEnrollmentStatusDialogProps) {
  const [status, setStatus] =
    useState(value);

  return (
    <Modal
      open={open}
      title="Update Enrollment Status"
      onClose={onClose}
    >
      <div className="space-y-4">
        <div className="grid gap-1">
          <Label required>
            Status
          </Label>

          <AppSelect
            value={status}
            onValueChange={(value) =>
              setStatus(
                value as EnrollmentStatus,
              )
            }
            options={
              ENROLLMENT_STATUS_OPTIONS
            }
          />
        </div>

        <div className="flex justify-end">
          <Button
            loading={loading}
            onClick={() =>
              onSubmit(status)
            }
          >
            Update
          </Button>
        </div>
      </div>
    </Modal>
  );
}