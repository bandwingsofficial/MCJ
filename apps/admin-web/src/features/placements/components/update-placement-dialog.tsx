"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/src/shared/components/ui/button";
import { FormError } from "@/src/shared/components/ui/form-error";
import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";
import { Modal } from "@/src/shared/components/ui/model";
import { AppSelect } from "@/src/shared/components/ui/select";
import { Textarea } from "@/src/shared/components/ui/textarea";
import { appToast } from "@/src/shared/components/ui/toast";

import { PLACEMENT_STATUS_OPTIONS } from "@/src/features/placements/constants/placement.constants";
import {
  updatePlacementSchema,
  type UpdatePlacementFormValues,
} from "@/src/features/placements/schemas/placement.schema";

import type {
  Placement,
  UpdatePlacementRequest,
} from "@/src/features/placements/types/placement.types";

interface UpdatePlacementModalProps {
  open: boolean;

  placement: Placement | null;

  isSubmitting: boolean;

  onClose: () => void;

  onSubmit: (
    payload: UpdatePlacementRequest,
  ) => Promise<boolean>;
}

export function UpdatePlacementModal({
  open,
  placement,
  isSubmitting,
  onClose,
  onSubmit,
}: UpdatePlacementModalProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdatePlacementFormValues>({
    resolver: zodResolver(
      updatePlacementSchema,
    ),
  });

  useEffect(() => {
    if (!placement) {
      return;
    }

    reset({
      status: placement.status,
      joiningDate:
        placement.joiningDate?.split(
          "T",
        )[0] ?? "",
      remarks:
        placement.remarks ?? "",
    });
  }, [placement, reset]);

  const handleFormSubmit = async (
    values: UpdatePlacementFormValues,
  ) => {
    const success =
      await onSubmit({
        status: values.status,
        joiningDate:
          values.joiningDate || null,
        remarks:
          values.remarks || null,
      });

    if (!success) {
      appToast.error(
        "Failed to update placement.",
      );

      return;
    }

    appToast.success(
      "Placement updated successfully.",
    );

    onClose();
  };

  return (
    <Modal
      open={open}
      title="Update Placement"
      onClose={onClose}
    >
      <form
        onSubmit={handleSubmit(
          handleFormSubmit,
        )}
        className="space-y-5"
      >
        <div>
          <Label required>
            Status
          </Label>

          <Controller
            control={control}
            name="status"
            render={({
              field,
            }) => (
              <AppSelect
                value={
                  field.value
                }
                onValueChange={
                  field.onChange
                }
                options={
                  PLACEMENT_STATUS_OPTIONS
                }
              />
            )}
          />

          <FormError
            message={
              errors.status
                ?.message
            }
          />
        </div>

        <div>
          <Label>
            Joining Date
          </Label>

          <Input
            type="date"
            {...register(
              "joiningDate",
            )}
          />

          <FormError
            message={
              errors
                .joiningDate
                ?.message
            }
          />
        </div>

        <div>
          <Label>
            Remarks
          </Label>

          <Textarea
            rows={4}
            {...register(
              "remarks",
            )}
          />

          <FormError
            message={
              errors.remarks
                ?.message
            }
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            loading={
              isSubmitting
            }
          >
            Update Placement
          </Button>
        </div>
      </form>
    </Modal>
  );
}