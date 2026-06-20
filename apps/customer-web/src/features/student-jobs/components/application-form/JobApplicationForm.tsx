"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  useForm,
} from "react-hook-form";

import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";

import {
  applyJobSchema,
  type ApplyJobSchema,
} from "@/src/features/student-jobs/schemas";

import {
  CoverLetterField,
  CurrentLocationField,
  ExpectedSalaryField,
  RemarksField,
} from "@/src/features/student-jobs/components/application-form";

interface JobApplicationFormProps {
  isSubmitting: boolean;

  onSubmit: (
    values: ApplyJobSchema,
  ) => Promise<void>;
}

export function JobApplicationForm({
  isSubmitting,
  onSubmit,
}: JobApplicationFormProps) {
  const form =
    useForm<ApplyJobSchema>({
      resolver: zodResolver(
        applyJobSchema,
      ),

      defaultValues: {
        coverLetter: "",

        currentLocation: "",

        expectedSalary: 0,

        remarks: "",
      },
    });

  const handleSubmit =
    async (
      values: ApplyJobSchema,
    ) => {
      await onSubmit(values);
    };

  return (
    <Card className="space-y-6 p-6">
      <form
        onSubmit={form.handleSubmit(
          handleSubmit,
        )}
        className="space-y-5"
      >
        <CoverLetterField
          control={form.control}
          error={
            form.formState.errors
              .coverLetter?.message
          }
        />

        <CurrentLocationField
          control={form.control}
          error={
            form.formState.errors
              .currentLocation?.message
          }
        />

        <ExpectedSalaryField
          control={form.control}
          error={
            form.formState.errors
              .expectedSalary?.message
          }
        />

        <RemarksField
          control={form.control}
          error={
            form.formState.errors
              .remarks?.message
          }
        />

        <Button
          type="submit"
          loading={isSubmitting}
          className="w-full"
        >
          Apply Now
        </Button>
      </form>
    </Card>
  );
}