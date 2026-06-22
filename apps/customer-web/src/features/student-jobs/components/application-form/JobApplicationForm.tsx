"use client";

import { Controller, useForm } from "react-hook-form";
import type { Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";
import { Textarea } from "@/src/shared/components/ui/textarea";
import { FormError } from "@/src/shared/components/ui/form-error";
import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";

import {
  applyJobSchema,
  type ApplyJobSchema,
} from "@/src/features/student-jobs/schemas";

// ==========================================
// Field Components
// ==========================================

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
        <div className="space-y-1.5">
          <Label required className="text-sm font-medium text-slate-700">
            Cover Letter
          </Label>

          <Textarea
            {...field}
            rows={6}
            className="w-full resize-none rounded-md border border-slate-200 p-3 text-sm shadow-sm transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
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
        <div className="space-y-1.5">
          <Label required className="text-sm font-medium text-slate-700">
            Current Location
          </Label>

          <Input
            {...field}
            className="w-full h-10 rounded-md border border-slate-200 px-3 text-sm shadow-sm transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
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
        <div className="space-y-1.5">
          <Label required className="text-sm font-medium text-slate-700">
            Expected Salary
          </Label>

          <Input
            type="number"
            min={0}
            value={field.value}
            className="w-full h-10 rounded-md border border-slate-200 px-3 text-sm shadow-sm transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
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
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-slate-700">
            Remarks
          </Label>

          <Textarea
            {...field}
            rows={3}
            className="w-full resize-none rounded-md border border-slate-200 p-3 text-sm shadow-sm transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
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

// ==========================================
// Main Form Component
// ==========================================

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
    <div className="w-full max-w-2xl mx-auto px-4 py-4">
      <Card className="border border-slate-150 shadow-sm rounded-xl overflow-hidden bg-white">
        <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">Application Details</h2>
          <p className="text-xs text-slate-500 mt-0.5">Please provide clean and valid inputs below.</p>
        </div>

        <form
          onSubmit={form.handleSubmit(
            handleSubmit,
          )}
          className="p-5 space-y-4"
        >
          <CoverLetterField
            control={form.control}
            error={
              form.formState.errors
                .coverLetter?.message
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          <RemarksField
            control={form.control}
            error={
              form.formState.errors
                .remarks?.message
            }
          />

          <div className="pt-2">
            <Button
              type="submit"
              loading={isSubmitting}
              className="w-full h-10 font-medium transition-transform active:scale-[0.99]"
            >
              Apply Now
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}