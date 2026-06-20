"use client";

import { useEffect } from "react";
import { useBranches } from "@/src/features/branches/hooks/use-branches";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Controller,
  useForm,
} from "react-hook-form";

import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";
import { Textarea } from "@/src/shared/components/ui/textarea";
import { FormError } from "@/src/shared/components/ui/form-error";
import { AppSelect } from "@/src/shared/components/ui/select";

import {
  DEFAULT_CREATE_STUDENT_VALUES,
  STUDENT_GENDER_OPTIONS,
  STUDENT_STATUS_OPTIONS,
} from "@/src/features/students/constants/student.constants";

import {
  studentSchema,
  StudentFormSchema,
} from "@/src/features/students/schemas/student.schema";

import {
  CreateStudentRequest,
} from "@/src/features/students/types/student.types";

interface StudentFormProps {
  defaultValues?: Partial<CreateStudentRequest>;

  loading?: boolean;

  submitLabel?: string;

  onSubmit: (
    values: CreateStudentRequest
  ) => Promise<void> | void;
}

export function StudentForm({
  defaultValues,
  loading = false,
  submitLabel = "Save Student",
  onSubmit,
}: StudentFormProps) {
  const {
    register,

    control,

    handleSubmit,

    reset,

    formState: {
      errors,
    },
  } = useForm<StudentFormSchema>({
    resolver: zodResolver(
      studentSchema
    ),
    

    defaultValues: {
      ...DEFAULT_CREATE_STUDENT_VALUES,

      ...defaultValues,
    },
  });

  const {
  branches,
} = useBranches();

  useEffect(() => {
    if (defaultValues) {
      reset({
        ...DEFAULT_CREATE_STUDENT_VALUES,

        ...defaultValues,
      });
    }
  }, [
    defaultValues,
    reset,
  ]);

  const submitHandler =
    async (
      values: StudentFormSchema
    ) => {
      await onSubmit(
        values
      );
    };

  return (
    <form
      onSubmit={handleSubmit(
        submitHandler
      )}
      className="space-y-8"
    >

      {/* PERSONAL INFORMATION */}

      <Card className="p-6 space-y-6">

        <div>

          <h2 className="text-lg font-semibold">

            Personal Information

          </h2>

        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          <div>

            <Label required>

              First Name

            </Label>

            <Input
              placeholder="Enter first name"
              {...register(
                "firstName"
              )}
            />

            <FormError
              message={
                errors.firstName
                  ?.message
              }
            />

          </div>

          <div>

            <Label required>

              Last Name

            </Label>

            <Input
              placeholder="Enter last name"
              {...register(
                "lastName"
              )}
            />

            <FormError
              message={
                errors.lastName
                  ?.message
              }
            />

          </div>

          <div>

            <Label required>

              Email

            </Label>

            <Input
              type="email"
              placeholder="Enter email"
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

            <Label required>

              Phone

            </Label>

            <Input
              placeholder="Enter phone"

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

          <div>

            <Label required>

              Gender

            </Label>

            <Controller
              control={control}

              name="gender"

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
                    [...STUDENT_GENDER_OPTIONS]
                  }
                />
              )}
            />

            <FormError
              message={
                errors.gender
                  ?.message
              }
            />

          </div>

          <div>

            <Label required>

              Date Of Birth

            </Label>

            <Input
              type="date"

              {...register(
                "dateOfBirth"
              )}
            />

            <FormError
              message={
                errors.dateOfBirth
                  ?.message
              }
            />

          </div>

        </div>

      </Card>

      {/* ACADEMIC INFORMATION */}

      <Card className="p-6 space-y-6">

        <div>

          <h2 className="text-lg font-semibold">

            Academic Information

          </h2>

        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          <div>

            <Label>

              Qualification

            </Label>

            <Input
              placeholder="Qualification"

              {...register(
                "qualification"
              )}
            />

          </div>

          <div>

            <Label>

              College Name

            </Label>

            <Input
              placeholder="College Name"

              {...register(
                "collegeName"
              )}
            />

          </div>

          <div>

            <Label>

              Specialization

            </Label>

            <Input
              placeholder="Specialization"

              {...register(
                "specialization"
              )}
            />

          </div>

          <div>

            <Label>

              Passing Year

            </Label>

            <Input
              type="number"

              {...register(
                "passingYear",
                {
                  valueAsNumber: true,
                }
              )}
            />

            <FormError
              message={
                errors.passingYear
                  ?.message
              }
            />

          </div>

        </div>

      </Card>
            {/* ADDRESS INFORMATION */}

      <Card className="p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold">
            Address Information
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          <div className="md:col-span-2">
            <Label>
              Address Line 1
            </Label>

            <Input
              placeholder="Address Line 1"
              {...register(
                "addressLine1"
              )}
            />

            <FormError
              message={
                errors.addressLine1?.message
              }
            />
          </div>

          <div className="md:col-span-2">
            <Label>
              Address Line 2
            </Label>

            <Input
              placeholder="Address Line 2"
              {...register(
                "addressLine2"
              )}
            />

            <FormError
              message={
                errors.addressLine2?.message
              }
            />
          </div>

          <div>
            <Label>
              City
            </Label>

            <Input
              placeholder="City"
              {...register("city")}
            />

            <FormError
              message={
                errors.city?.message
              }
            />
          </div>

          <div>
            <Label>
              State
            </Label>

            <Input
              placeholder="State"
              {...register("state")}
            />

            <FormError
              message={
                errors.state?.message
              }
            />
          </div>

          <div>
            <Label>
              Country
            </Label>

            <Input
              placeholder="Country"
              {...register(
                "country"
              )}
            />

            <FormError
              message={
                errors.country?.message
              }
            />
          </div>

          <div>
            <Label>
              Postal Code
            </Label>

            <Input
              placeholder="Postal Code"
              {...register(
                "postalCode"
              )}
            />

            <FormError
              message={
                errors.postalCode?.message
              }
            />
          </div>

        </div>
      </Card>

      {/* PARENT INFORMATION */}

      <Card className="p-6 space-y-6">

        <div>
          <h2 className="text-lg font-semibold">
            Parent Information
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          <div>

            <Label>
              Parent Name
            </Label>

            <Input
              placeholder="Parent Name"
              {...register(
                "parentName"
              )}
            />

            <FormError
              message={
                errors.parentName?.message
              }
            />

          </div>

          <div>

            <Label>
              Parent Phone
            </Label>

            <Input
              placeholder="Parent Phone"
              {...register(
                "parentPhone"
              )}
            />

            <FormError
              message={
                errors.parentPhone?.message
              }
            />

          </div>

        </div>

      </Card>

      {/* EMERGENCY CONTACT */}

      <Card className="p-6 space-y-6">

        <div>

          <h2 className="text-lg font-semibold">
            Emergency Contact
          </h2>

        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          <div>

            <Label>
              Contact Name
            </Label>

            <Input
              placeholder="Emergency Contact Name"
              {...register(
                "emergencyContactName"
              )}
            />

            <FormError
              message={
                errors
                  .emergencyContactName
                  ?.message
              }
            />

          </div>

          <div>

            <Label>
              Contact Phone
            </Label>

            <Input
              placeholder="Emergency Contact Phone"
              {...register(
                "emergencyContactPhone"
              )}
            />

            <FormError
              message={
                errors
                  .emergencyContactPhone
                  ?.message
              }
            />

          </div>

        </div>

      </Card>

      {/* ADMISSION INFORMATION */}

      <Card className="p-6 space-y-6">

        <div>

          <h2 className="text-lg font-semibold">
            Admission Information
          </h2>

        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          <div>

            <Label required>
              Admission Date
            </Label>

            <Input
              type="date"
              {...register(
                "admissionDate"
              )}
            />

            <FormError
              message={
                errors
                  .admissionDate
                  ?.message
              }
            />

          </div>

          <div>

            <Label required>
              Branch
            </Label>

            <Controller
              control={control}
              name="branchId"
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
                 options={branches.map((branch) => ({
  label: branch.branchName,
  value: branch.id,
}))}
                />
              )}
            />

            <FormError
              message={
                errors.branchId
                  ?.message
              }
            />

          </div>

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
                    [...STUDENT_STATUS_OPTIONS]
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

          <div className="md:col-span-2">

            <Label>
              Notes
            </Label>

            <Textarea
              placeholder="Notes"
              {...register(
                "notes"
              )}
            />

            <FormError
              message={
                errors.notes
                  ?.message
              }
            />

          </div>

        </div>

      </Card>

      <div className="flex justify-end gap-3">

        <Button
          type="submit"
          loading={loading}
        >
          {submitLabel}
        </Button>

      </div>

    </form>
  );
}