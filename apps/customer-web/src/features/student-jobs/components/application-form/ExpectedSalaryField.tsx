"use client";

import { Controller } from "react-hook-form";
import type { Control } from "react-hook-form";

import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";
import { FormError } from "@/src/shared/components/ui/form-error";

import type { ApplyJobSchema } from "@/src/features/student-jobs/schemas";

interface ExpectedSalaryFieldProps {
  control: Control<ApplyJobSchema>;
  error?: string;
}

export function ExpectedSalaryField({
  control,
  error,
}: ExpectedSalaryFieldProps) {
  return (
    <Controller
      control={control}
      name="expectedSalary"
      render={({ field }) => (
        <div className="space-y-2">
          <Label required>
            Expected Salary
          </Label>

          <Input
            type="number"
            min={0}
            value={field.value}
            placeholder="700000"
            aria-label="Expected Salary"
            onChange={(event) =>
              field.onChange(
                Number(event.target.value),
              )
            }
          />

          <FormError
            message={error}
          />
        </div>
      )}
    />
  );
}