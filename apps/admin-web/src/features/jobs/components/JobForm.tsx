"use client";

import { useEffect } from "react";

import { useFieldArray, useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { Input } from "@/src/shared/components/ui/input";
import { Textarea } from "@/src/shared/components/ui/textarea";
import { Label } from "@/src/shared/components/ui/label";
import { Switch } from "@/src/shared/components/ui/switch";
import { Separator } from "@/src/shared/components/ui/separator";
import { AppSelect } from "@/src/shared/components/ui/select";
import { FormError } from "@/src/shared/components/ui/form-error";

import {
  EMPLOYMENT_TYPES,
  JOB_STATUS_OPTIONS,
  WORKING_DAYS,
} from "@/src/features/jobs/constants/job.constants";

import {
  createJobSchema,
  type CreateJobFormValues,
} from "@/src/features/jobs/schemas/job.schema";

import { JobFormUtils } from "@/src/features/jobs/utils/job-form.utils";

import type {
  Job,
  CreateJobRequest,
} from "@/src/features/jobs/types/job.types";

interface JobFormProps {
  initialData?: Job;

  isSubmitting: boolean;

  onSubmit: (
    values: CreateJobRequest,
  ) => Promise<void>;
}

export function JobForm({
  initialData,
  isSubmitting,
  onSubmit,
}: JobFormProps) {
  const form = useForm<CreateJobFormValues>({
    resolver: zodResolver(
      createJobSchema,
    ),
    defaultValues:
      JobFormUtils.createDefaultValues(),
    mode: "onBlur",
  });

  const {
    register,
    control,
    reset,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const {
    fields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "interviewProcess",
  });

  useEffect(() => {
    if (!initialData) {
      return;
    }

    reset({
      title: initialData.title,

      companyName:
        initialData.companyName,

      companyLogo:
        initialData.companyLogo ??
        "",

      companyWebsite:
        initialData.companyWebsite ??
        "",

      companyDescription:
        initialData.companyDescription ??
        "",

      shortDescription:
        initialData.shortDescription ??
        "",

      description:
        initialData.description,

      location:
        initialData.location,

      city: initialData.city,

      state: initialData.state,

      country:
        initialData.country,

      isRemote:
        initialData.isRemote,

      employmentType:
        initialData.employmentType,

      workingDays:
        initialData.workingDays,
        status: initialData.status,

      minExperience:
        initialData.minExperience,

      maxExperience:
        initialData.maxExperience,

      minSalary:
        initialData.minSalary,

      maxSalary:
        initialData.maxSalary,

      salaryCurrency:
        initialData.salaryCurrency,

      vacancies:
        initialData.vacancies,

      applicationDeadline:
        initialData.applicationDeadline.slice(
          0,
          10,
        ),

      responsibilities:
        JobFormUtils.arrayToString(
          initialData.responsibilities,
        ),

      skills:
        JobFormUtils.arrayToString(
          initialData.skills,
        ),

      eligibilityTitle:
        initialData.eligibilityTitle,

      interviewProcess:
        initialData
          .interviewProcess,
    });
  }, [initialData, reset]);

  const submitHandler = async (
    values: CreateJobFormValues,
  ) => {
    await onSubmit({
      ...values,
       status: values.status,
      responsibilities:
        JobFormUtils.stringToArray(
          values.responsibilities,
        ),

      skills:
        JobFormUtils.stringToArray(
          values.skills,
        ),

      interviewProcess:
        JobFormUtils.normalizeInterviewProcess(
          values.interviewProcess,
        ),
    });
  };

  return (
    <form
      onSubmit={handleSubmit(
        submitHandler,
      )}
      className="space-y-8"
    >
      <Card className="space-y-6 p-6">
        <div>
          <h2 className="text-lg font-semibold">
            Basic Information
          </h2>

          <p className="text-sm text-muted-foreground">
            Enter the primary job
            details.
          </p>
        </div>

        <Separator />

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label required>
              Job Title
            </Label>

            <Input
              placeholder="Senior Frontend Developer"
              {...register("title")}
            />

            <FormError
              message={
                errors.title
                  ?.message
              }
            />
          </div>

          <div className="space-y-2">
            <Label required>
              Company Name
            </Label>

            <Input
              placeholder="OpenAI"
              {...register(
                "companyName",
              )}
            />

            <FormError
              message={
                errors
                  .companyName
                  ?.message
              }
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label required>
              Description
            </Label>

            <Textarea
              rows={6}
              placeholder="Write detailed job description..."
              {...register(
                "description",
              )}
            />

            <FormError
              message={
                errors
                  .description
                  ?.message
              }
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>
              Short Description
            </Label>

            <Textarea
              rows={3}
              placeholder="Short summary..."
              {...register(
                "shortDescription",
              )}
            />

            <FormError
              message={
                errors
                  .shortDescription
                  ?.message
              }
            />
          </div>

          <div className="space-y-2">
            <Label required>
              Employment Type
            </Label>

            <AppSelect
              value={watch(
                "employmentType",
              )}
              options={
                EMPLOYMENT_TYPES
              }
              onValueChange={(value) => {
  setValue("employmentType", value as CreateJobFormValues["employmentType"], {
    shouldValidate: true,
  });
}}
            />

            <FormError
              message={
                errors
                  .employmentType
                  ?.message
              }
            />
          </div>

          <div className="space-y-2">
            <Label required>
              Working Days
            </Label>

            <AppSelect
              value={watch(
                "workingDays",
              )}
              options={
                WORKING_DAYS
              }
              onValueChange={(
                value,
              ) =>
                setValue(
                  "workingDays",
                  value as never,
                  {
                    shouldValidate: true,
                  },
                )
              }
            />

            <FormError
              message={
                errors
                  .workingDays
                  ?.message
              }
            />
          </div>

          <div className="flex items-center gap-3 pt-8">
            <Switch
              checked={watch(
                "isRemote",
              )}
              onCheckedChange={(
                checked,
              ) =>
                setValue(
                  "isRemote",
                  checked,
                  {
                    shouldValidate: true,
                  },
                )
              }
            />

            <Label>
              Remote Job
            </Label>
          </div>
        </div>
      </Card>
            <Card className="space-y-6 p-6">
        <div>
          <h2 className="text-lg font-semibold">
            Company Information
          </h2>

          <p className="text-sm text-muted-foreground">
            Provide company related
            information.
          </p>
        </div>

        <Separator />

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label>
              Company Website
            </Label>

            <Input
              placeholder="https://company.com"
              {...register(
                "companyWebsite",
              )}
            />

            <FormError
              message={
                errors
                  .companyWebsite
                  ?.message
              }
            />
          </div>

          <div className="space-y-2">
            <Label>
              Company Logo
            </Label>

            <Input
              placeholder="https://company.com/logo.png"
              {...register(
                "companyLogo",
              )}
            />

            <FormError
              message={
                errors
                  .companyLogo
                  ?.message
              }
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>
              Company Description
            </Label>

            <Textarea
              rows={5}
              placeholder="Brief description about the company..."
              {...register(
                "companyDescription",
              )}
            />

            <FormError
              message={
                errors
                  .companyDescription
                  ?.message
              }
            />
          </div>
        </div>
      </Card>

      <Card className="space-y-6 p-6">
        <div>
          <h2 className="text-lg font-semibold">
            Job Location
          </h2>

          <p className="text-sm text-muted-foreground">
            Specify where this job
            is located.
          </p>
        </div>

        <Separator />

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label required>
              Country
            </Label>

            <Input
              placeholder="India"
              {...register(
                "country",
              )}
            />

            <FormError
              message={
                errors.country
                  ?.message
              }
            />
          </div>

          <div className="space-y-2">
            <Label required>
              State
            </Label>

            <Input
              placeholder="Karnataka"
              {...register(
                "state",
              )}
            />

            <FormError
              message={
                errors.state
                  ?.message
              }
            />
          </div>

          <div className="space-y-2">
            <Label required>
              City
            </Label>

            <Input
              placeholder="Bangalore"
              {...register(
                "city",
              )}
            />

            <FormError
              message={
                errors.city
                  ?.message
              }
            />
          </div>

          <div className="space-y-2">
            <Label required>
              Full Location
            </Label>

            <Input
              placeholder="Whitefield, Bangalore"
              {...register(
                "location",
              )}
            />

            <FormError
              message={
                errors
                  .location
                  ?.message
              }
            />
          </div>
        </div>
      </Card>

      <Card className="space-y-6 p-6">
        <div>
          <h2 className="text-lg font-semibold">
            Employment Details
          </h2>

          <p className="text-sm text-muted-foreground">
            Experience, salary and
            vacancy information.
          </p>
        </div>

        <Separator />

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label required>
              Minimum Experience
            </Label>

            <Input
              type="number"
              {...register(
                "minExperience",
                {
                  valueAsNumber: true,
                },
              )}
            />

            <FormError
              message={
                errors
                  .minExperience
                  ?.message
              }
            />
          </div>

          <div className="space-y-2">
            <Label required>
              Maximum Experience
            </Label>

            <Input
              type="number"
              {...register(
                "maxExperience",
                {
                  valueAsNumber: true,
                },
              )}
            />

            <FormError
              message={
                errors
                  .maxExperience
                  ?.message
              }
            />
          </div>

          <div className="space-y-2">
            <Label required>
              Minimum Salary
            </Label>

            <Input
              type="number"
              {...register(
                "minSalary",
                {
                  valueAsNumber: true,
                },
              )}
            />

            <FormError
              message={
                errors
                  .minSalary
                  ?.message
              }
            />
          </div>

          <div className="space-y-2">
            <Label required>
              Maximum Salary
            </Label>

            <Input
              type="number"
              {...register(
                "maxSalary",
                {
                  valueAsNumber: true,
                },
              )}
            />

            <FormError
              message={
                errors
                  .maxSalary
                  ?.message
              }
            />
          </div>

          <div className="space-y-2">
            <Label required>
              Currency
            </Label>

            <Input
              placeholder="INR"
              {...register(
                "salaryCurrency",
              )}
            />

            <FormError
              message={
                errors
                  .salaryCurrency
                  ?.message
              }
            />
          </div>

          <div className="space-y-2">
            <Label required>
              Vacancies
            </Label>

            <Input
              type="number"
              {...register(
                "vacancies",
                {
                  valueAsNumber: true,
                },
              )}
            />

            <FormError
              message={
                errors
                  .vacancies
                  ?.message
              }
            />
          </div>
        </div>
      </Card>
            <Card className="space-y-6 p-6">
        <div>
          <h2 className="text-lg font-semibold">
            Eligibility & Application
          </h2>

          <p className="text-sm text-muted-foreground">
            Configure eligibility and
            application deadline.
          </p>
        </div>

        <Separator />

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label required>
              Eligibility
            </Label>

            <Input
              placeholder="B.E / B.Tech"
              {...register(
                "eligibilityTitle",
              )}
            />

            <FormError
              message={
                errors
                  .eligibilityTitle
                  ?.message
              }
            />
          </div>

          <div className="space-y-2">
            <Label required>
              Application Deadline
            </Label>

            <Input
              type="date"
              {...register(
                "applicationDeadline",
              )}
            />

            <FormError
              message={
                errors
                  .applicationDeadline
                  ?.message
              }
            />
          </div>

          {initialData && (
            <div className="space-y-2">
              <Label>Status</Label>

              <AppSelect
  value={watch("status")}
  options={JOB_STATUS_OPTIONS}
  onValueChange={(value) => {
    setValue(
      "status",
      value as CreateJobFormValues["status"],
      {
        shouldValidate: true,
        shouldDirty: true,
      },
    );
  }}
/>

              <FormError
                message={
                  errors.status
                    ?.message
                }
              />
            </div>
          )}
        </div>
      </Card>

      <Card className="space-y-6 p-6">
        <div>
          <h2 className="text-lg font-semibold">
            Responsibilities
          </h2>

          <p className="text-sm text-muted-foreground">
            One responsibility per line.
          </p>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label required>
            Responsibilities
          </Label>

          <Textarea
            rows={8}
            placeholder={`Develop scalable applications
Review pull requests
Mentor junior developers`}
            {...register(
              "responsibilities",
            )}
          />

          <FormError
            message={
              errors
                .responsibilities
                ?.message
            }
          />
        </div>
      </Card>

      <Card className="space-y-6 p-6">
        <div>
          <h2 className="text-lg font-semibold">
            Skills
          </h2>

          <p className="text-sm text-muted-foreground">
            One skill per line.
          </p>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label required>
            Required Skills
          </Label>

          <Textarea
            rows={8}
            placeholder={`React
Next.js
TypeScript
Node.js`}
            {...register("skills")}
          />

          <FormError
            message={
              errors.skills
                ?.message
            }
          />
        </div>
      </Card>

      <Card className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              Interview Process
            </h2>

            <p className="text-sm text-muted-foreground">
              Add interview rounds.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              append(
                JobFormUtils.createEmptyInterview(),
              )
            }
          >
            Add Round
          </Button>
        </div>

        <Separator />

        <div className="space-y-6">
          {fields.map(
            (
              field,
              index,
            ) => (
              <Card
                key={field.id}
                className="space-y-4 border p-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">
                    Round{" "}
                    {index + 1}
                  </h3>

                  {fields.length >
                    1 && (
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() =>
                        remove(
                          index,
                        )
                      }
                    >
                      Remove
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <Label required>
                    Round Title
                  </Label>

                  <Input
                    placeholder="Technical Interview"
                    {...register(
                      `interviewProcess.${index}.title`,
                    )}
                  />

                  <FormError
                    message={
                      errors
                        .interviewProcess?.[
                        index
                      ]?.title
                        ?.message
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label required>
                    Description
                  </Label>

                  <Textarea
                    rows={3}
                    placeholder="Describe this interview round..."
                    {...register(
                      `interviewProcess.${index}.description`,
                    )}
                  />

                  <FormError
                    message={
                      errors
                        .interviewProcess?.[
                        index
                      ]
                        ?.description
                        ?.message
                    }
                  />
                </div>
              </Card>
            ),
          )}
        </div>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            reset(
              JobFormUtils.createDefaultValues(),
            )
          }
        >
          Reset
        </Button>

        <Button
          type="submit"
          loading={
            isSubmitting
          }
        >
          {initialData
            ? "Update Job"
            : "Create Job"}
        </Button>
      </div>
    </form>
  );
}