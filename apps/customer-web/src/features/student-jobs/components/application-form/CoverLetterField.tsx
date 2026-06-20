"use client";

import { Controller } from "react-hook-form";
import type { Control } from "react-hook-form";

import { Label } from "@/src/shared/components/ui/label";
import { Textarea } from "@/src/shared/components/ui/textarea";
import { FormError } from "@/src/shared/components/ui/form-error";

import type { ApplyJobSchema } from "@/src/features/student-jobs/schemas";

interface CoverLetterFieldProps {
  control: Control<ApplyJobSchema>;
  error?: string;
}

export function CoverLetterField({
  control,
  error,
}: CoverLetterFieldProps) {
  return (
    <Controller
      control={control}
      name="coverLetter"
      render={({ field }) => (
        <div className="space-y-2">
          <Label required>
            Cover Letter
          </Label>

          <Textarea
            {...field}
            rows={8}
            placeholder="Write your cover letter"
            aria-label="Cover Letter"
          />

          <FormError
            message={error}
          />
        </div>
      )}
    />
  );
}