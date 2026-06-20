"use client";

import { Controller } from "react-hook-form";
import type { Control } from "react-hook-form";

import { Label } from "@/src/shared/components/ui/label";
import { Textarea } from "@/src/shared/components/ui/textarea";
import { FormError } from "@/src/shared/components/ui/form-error";

import type { ApplyJobSchema } from "@/src/features/student-jobs/schemas";

interface RemarksFieldProps {
  control: Control<ApplyJobSchema>;
  error?: string;
}

export function RemarksField({
  control,
  error,
}: RemarksFieldProps) {
  return (
    <Controller
      control={control}
      name="remarks"
      render={({ field }) => (
        <div className="space-y-2">
          <Label>
            Remarks
          </Label>

          <Textarea
            {...field}
            rows={4}
            placeholder="Additional remarks (optional)"
            aria-label="Remarks"
          />

          <FormError
            message={error}
          />
        </div>
      )}
    />
  );
}