"use client";

import { useEffect } from "react";

import {
  useForm,
} from "react-hook-form";

import {
  zodResolver,
} from "@hookform/resolvers/zod";

import { Modal } from "@/src/shared/components/ui/model";

import { Input } from "@/src/shared/components/ui/input";

import { Textarea } from "@/src/shared/components/ui/textarea";

import { AppSelect } from "@/src/shared/components/ui/select";

import { Switch } from "@/src/shared/components/ui/switch";

import { Button } from "@/src/shared/components/ui/button";

import { FormError } from "@/src/shared/components/ui/form-error";

import {
  createTrainerSchema,
} from "@/src/features/trainers/schemas/trainer.schema";

import type {
  CreateTrainerFormValues,
} from "@/src/features/trainers/schemas/trainer.schema";
import {
  TRAINER_GENDERS,
  TRAINER_TYPES,
} from "@/src/features/trainers/constants/trainer.constants";

import type {
  TrainerDetails,
} from "@/src/features/trainers/types/trainer.types";

interface TrainerFormProps {
  open: boolean;

  trainer?: TrainerDetails | null;

  loading: boolean;

  onClose: () => void;

  onSubmit: (
    values: CreateTrainerFormValues
  ) => Promise<void>;
}

export function TrainerForm({
  open,
  trainer,
  loading,
  onClose,
  onSubmit,
}: TrainerFormProps) {
 const {
  register,
  handleSubmit,
  reset,
  watch,
  setValue,
  formState: { errors },
} = useForm({
  resolver: zodResolver(
    createTrainerSchema
  ),
  defaultValues: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "MALE",
    bio: "",
    qualification: "",
    specialization: "",
    skills: [],
    employeeCode: "",
    trainerType: "FULL_TIME",
    isFeatured: false,
    averageRating: 0,
    totalReviews: 0,
    courseIds: [],
  },
});

  useEffect(() => {
    if (!trainer) {
      return;
    }

    reset({
      firstName:
        trainer.firstName,

      lastName:
        trainer.lastName ??
        "",

      email:
        trainer.email ??
        "",

      phone:
        trainer.phone ??
        "",

      bio:
        trainer.bio ??
        "",

      qualification:
        trainer.qualification ??
        "",

      specialization:
        trainer.specialization ??
        "",

      employeeCode:
        trainer.employeeCode ??
        "",

      trainerType:
        trainer.trainerType,

      averageRating:
        trainer.averageRating,

      totalReviews:
        trainer.totalReviews,

      isFeatured:
        trainer.isFeatured,
    });
  }, [
    trainer,
    reset,
  ]);

  return (
    <Modal
      open={open}
      title={
        trainer
          ? "Edit Trainer"
          : "Create Trainer"
      }
      onClose={onClose}
    >
      <form
  onSubmit={handleSubmit(
    async (data) => {
      await onSubmit(data);
    }
  )}
>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              placeholder="First Name"
              {...register(
                "firstName"
              )}
            />

            <FormError
              message={
                errors
                  .firstName
                  ?.message
              }
            />
          </div>

          <div>
            <Input
              placeholder="Last Name"
              {...register(
                "lastName"
              )}
            />

            <FormError
              message={
                errors
                  .lastName
                  ?.message
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              placeholder="Email"
              {...register(
                "email"
              )}
            />

            <FormError
              message={
                errors.email
                  ?.message
              }
            />
          </div>

          <div>
            <Input
              placeholder="Phone"
              {...register(
                "phone"
              )}
            />

            <FormError
              message={
                errors.phone
                  ?.message
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <AppSelect
              value={watch(
                "gender"
              )}
              options={TRAINER_GENDERS.map(
                (
                  gender
                ) => ({
                  label:
                    gender,
                  value:
                    gender,
                })
              )}
              onValueChange={(
                value
              ) =>
                setValue(
                  "gender",
                  value as
                    | "MALE"
                    | "FEMALE"
                    | "OTHER"
                )
              }
            />

            <FormError
              message={
                errors.gender
                  ?.message
              }
            />
          </div>

          <div>
            <AppSelect
              value={watch(
                "trainerType"
              )}
              options={TRAINER_TYPES.map(
                (
                  type
                ) => ({
                  label:
                    type.replaceAll(
                      "_",
                      " "
                    ),
                  value:
                    type,
                })
              )}
              onValueChange={(
                value
              ) =>
                setValue(
                  "trainerType",
                  value as never
                )
              }
            />

            <FormError
              message={
                errors
                  .trainerType
                  ?.message
              }
            />
          </div>
        </div>

        <Input
          placeholder="Employee Code"
          {...register(
            "employeeCode"
          )}
        />

        <Textarea
          placeholder="Bio"
          {...register(
            "bio"
          )}
        />

        <Input
          placeholder="Qualification"
          {...register(
            "qualification"
          )}
        />

        <Input
          placeholder="Specialization"
          {...register(
            "specialization"
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            type="number"
            placeholder="Average Rating"
            {...register(
              "averageRating",
              {
                valueAsNumber:
                  true,
              }
            )}
          />

          <Input
            type="number"
            placeholder="Total Reviews"
            {...register(
              "totalReviews",
              {
                valueAsNumber:
                  true,
              }
            )}
          />
        </div>

        <div className="flex items-center gap-3">
          <Switch
            checked={watch(
              "isFeatured"
            )}
            onCheckedChange={(
              value
            ) =>
              setValue(
                "isFeatured",
                value
              )
            }
          />

          <span className="text-sm">
            Featured Trainer
          </span>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={
              onClose
            }
          >
            Cancel
          </Button>

          <Button
            type="submit"
            loading={loading}
          >
            {trainer
              ? "Update Trainer"
              : "Create Trainer"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}