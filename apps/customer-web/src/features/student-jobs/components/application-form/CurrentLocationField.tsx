"use client";

import { Controller } from "react-hook-form";
import type { Control } from "react-hook-form";

import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";
import { FormError } from "@/src/shared/components/ui/form-error";

import type { ApplyJobSchema } from "@/src/features/student-jobs/schemas";

interface CurrentLocationFieldProps {
  control: Control<ApplyJobSchema>;
  error?: string;
}

export function CurrentLocationField({
  control,
  error,
}: CurrentLocationFieldProps) {
  return (
    <Controller
      control={control}
      name="currentLocation"
      render={({ field }) => (
        <div className="space-y-2">
          <Label required>
            Current Location
          </Label>

          <Input
            {...field}
            placeholder="Enter your current location"
            aria-label="Current Location"
          />

          <FormError
            message={error}
          />
        </div>
      )}
    />
  );
}