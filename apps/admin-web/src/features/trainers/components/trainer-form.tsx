"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Modal } from "@/src/shared/components/ui/model";
import { Input } from "@/src/shared/components/ui/input";
import { Textarea } from "@/src/shared/components/ui/textarea";
import { AppSelect } from "@/src/shared/components/ui/select";
import { Switch } from "@/src/shared/components/ui/switch";
import { Button } from "@/src/shared/components/ui/button";
import { FormError } from "@/src/shared/components/ui/form-error";

// API/Hooks Context Integration
import { useBranches } from "@/src/features/branches/hooks/use-branches";
import { useCourses } from "@/src/features/courses/hooks/use-courses";

import { createTrainerSchema } from "@/src/features/trainers/schemas/trainer.schema";
import type { CreateTrainerFormValues } from "@/src/features/trainers/schemas/trainer.schema";
import {
  TRAINER_GENDERS,
  TRAINER_TYPES,
} from "@/src/features/trainers/constants/trainer.constants";
import type { TrainerDetails } from "@/src/features/trainers/types/trainer.types";

interface TrainerFormProps {
  open: boolean;
  trainer?: TrainerDetails | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (
  values:
    CreateTrainerFormValues,
  image:
    File | null
) => Promise<void>;
}

export function TrainerForm({
  open,
  trainer,
  loading,
  onClose,
  onSubmit,
}: TrainerFormProps) {
  const [skillInput, setSkillInput] = useState("");
  const [
  selectedImage,
  setSelectedImage,
] =
  useState<File | null>(
    null
  );

const [
  previewUrl,
  setPreviewUrl,
] =
  useState<string | null>(
    trainer
      ?.profileImageUrl ??
      null
  );

  // Dynamically load remote data sources
  const { branches, isLoading: branchesLoading } = useBranches({
    pageSize: 100,
    includeDeleted: false,
  });
  const { courses, isLoading: coursesLoading } = useCourses();
  
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createTrainerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      gender: "MALE",
      bio: "",
      qualification: "",
      specialization: "",
      skills: [] as string[],
      employeeCode: "",
      trainerType: "FULL_TIME",
      isFeatured: false,
      averageRating: 0,
      totalReviews: 0,
      courseIds: [] as string[],
      experienceYears: 0,
      branchId: "",
      joinedAt: "",
      linkedInUrl: "",
      youtubeUrl: "",
      instagramUrl: "",
    },
  });

  const currentSkills = watch("skills") || [];
  const selectedCourseIds = watch("courseIds") || [];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmedValue = skillInput.trim();
      if (trimmedValue && !currentSkills.includes(trimmedValue)) {
        setValue("skills", [...currentSkills, trimmedValue]);
        setSkillInput("");
      }
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setValue(
      "skills",
      currentSkills.filter((skill) => skill !== skillToRemove)
    );
  };

  // Toggle course selection matrix
  const handleCourseToggle = (courseId: string) => {
    if (selectedCourseIds.includes(courseId)) {
      setValue(
        "courseIds",
        selectedCourseIds.filter((id) => id !== courseId)
      );
    } else {
      setValue("courseIds", [...selectedCourseIds, courseId]);
    }
  };

  useEffect(() => {
    if (!trainer) {
      return;
    }
    useEffect(() => {
  if (!selectedImage) {
    return;
  }

  const objectUrl =
    URL.createObjectURL(
      selectedImage
    );

  setPreviewUrl(
    objectUrl
  );

  return () =>
    URL.revokeObjectURL(
      objectUrl
    );
}, [selectedImage]);

    reset({
      firstName: trainer.firstName,
      lastName: trainer.lastName ?? "",
      email: trainer.email ?? "",
      phone: trainer.phone ?? "",
      bio: trainer.bio ?? "",
      qualification: trainer.qualification ?? "",
      specialization: trainer.specialization ?? "",
      skills: trainer.skills ?? [],
      employeeCode: trainer.employeeCode ?? "",
      trainerType: trainer.trainerType,
      averageRating: trainer.averageRating,
      totalReviews: trainer.totalReviews,
      courseIds: trainer.courses?.map((c: any) => (typeof c === "object" ? c.id : c)) ?? [],
      isFeatured: trainer.isFeatured,
      experienceYears: trainer.experienceYears ?? 0,
      branchId: trainer.branchId ?? "",
      joinedAt: trainer.joinedAt ?? "",
      linkedInUrl: trainer.linkedInUrl ?? "",
      youtubeUrl: trainer.youtubeUrl ?? "",
      instagramUrl: trainer.instagramUrl ?? "",
    });
  }, [trainer, reset]);

  return (
    <Modal
      open={open}
      title={trainer ? "Edit Trainer" : "Create Trainer"}
      onClose={onClose}
    >
      <form
        className="space-y-4 pt-2"
        onSubmit={handleSubmit(async (data) => {
          // Convert empty string layout properties to undefined/null format payload to safely clear validations
          const submissionPayload = {
            ...data,
            lastName: data.lastName?.trim() === "" ? undefined : data.lastName,
            email: data.email?.trim() === "" ? undefined : data.email,
            phone: data.phone?.trim() === "" ? undefined : data.phone,
            bio: data.bio?.trim() === "" ? undefined : data.bio,
            qualification: data.qualification?.trim() === "" ? undefined : data.qualification,
            specialization: data.specialization?.trim() === "" ? undefined : data.specialization,
            employeeCode: data.employeeCode?.trim() === "" ? undefined : data.employeeCode,
            branchId: data.branchId?.trim() === "" ? undefined : data.branchId,
            joinedAt: data.joinedAt?.trim() === "" ? undefined : data.joinedAt,
            linkedInUrl: data.linkedInUrl?.trim() === "" ? (null as any) : data.linkedInUrl,
            youtubeUrl: data.youtubeUrl?.trim() === "" ? (null as any) : data.youtubeUrl,
            instagramUrl: data.instagramUrl?.trim() === "" ? (null as any) : data.instagramUrl,
          };
          await onSubmit(
  submissionPayload as any,
  selectedImage
);
        })}
      >
        <div className="flex flex-col gap-2">

  <label className="text-sm font-medium">
    Profile Image
  </label>

  {previewUrl && (
    <img
      src={previewUrl}
      alt="Trainer"
      className="h-32 w-32 rounded-md border object-contain"
    />
  )}

  <Input
    type="file"
    accept="image/*"
    onChange={(event) => {
      const file =
        event.target
          .files?.[0] ??
        null;

      setSelectedImage(
        file
      );
    }}
  />

</div>

        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted-foreground">
              First Name <span className="text-destructive text-red-500">*</span>
            </label>
            <Input placeholder="Enter first name" {...register("firstName")} />
            <FormError message={errors.firstName?.message} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted-foreground">
              Last Name
            </label>
            <Input placeholder="Enter last name" {...register("lastName")} />
            <FormError message={errors.lastName?.message} />
          </div>
        </div>

        {/* Contact Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted-foreground">
              Email Address
            </label>
            <Input
              type="email"
              placeholder="example@domain.com"
              {...register("email")}
            />
            <FormError message={errors.email?.message} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted-foreground">
              Phone Number
            </label>
            <Input placeholder="Enter phone number" {...register("phone")} />
            <FormError message={errors.phone?.message} />
          </div>
        </div>

        {/* Classification Selectors */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted-foreground">
              Gender
            </label>
            <AppSelect
              value={watch("gender")}
              options={TRAINER_GENDERS.map((gender) => ({
                label: gender,
                value: gender,
              }))}
              onValueChange={(value) =>
                setValue(
                  "gender",
                  value as "MALE" | "FEMALE" | "OTHER"
                )
              }
            />
            <FormError message={errors.gender?.message} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted-foreground">
              Trainer Type
            </label>
            <AppSelect
              value={watch("trainerType")}
              options={TRAINER_TYPES.map((type) => ({
                label: type.replaceAll("_", " "),
                value: type,
              }))}
              onValueChange={(value) =>
                setValue("trainerType", value as never)
              }
            />
            <FormError message={errors.trainerType?.message} />
          </div>
        </div>

        {/* Skills Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-muted-foreground">
            Skills <span className="text-xs text-neutral-400">(Press Enter to add)</span>
          </label>
          <Input
            placeholder="Type a skill and press Enter"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {currentSkills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1.5">
              {currentSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 text-sm px-2.5 py-1 rounded-md border text-foreground"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="text-muted-foreground hover:text-destructive text-xs font-bold transition-colors"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}
          <FormError message={errors.skills?.message} />
        </div>

        {/* Codes & Context */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted-foreground">
              Employee Code
            </label>
            <Input placeholder="e.g. TR001" {...register("employeeCode")} />
            <FormError message={errors.employeeCode?.message} />
          </div>

          {/* Branch Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted-foreground">
              Branch Selection
            </label>
            <AppSelect
              value={watch("branchId") || undefined}
              disabled={branchesLoading}
              options={branches?.map((branch) => ({
                label: branch.branchName,
                value: branch.id,
              })) || []}
              onValueChange={(value) => setValue("branchId", value)}
            />
            <FormError message={errors.branchId?.message} />
          </div>
        </div>

        {/* Text Area Bio */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-muted-foreground">
            Biography
          </label>
          <Textarea
            placeholder="Write a brief professional background description..."
            {...register("bio")}
          />
          <FormError message={errors.bio?.message} />
        </div>

        {/* Experience & Qualifications */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted-foreground">
              Qualification
            </label>
            <Input placeholder="e.g. Degree / Certification" {...register("qualification")} />
            <FormError message={errors.qualification?.message} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted-foreground">
              Specialization
            </label>
            <Input placeholder="e.g. Strength Training" {...register("specialization")} />
            <FormError message={errors.specialization?.message} />
          </div>
        </div>

        {/* Numbers & Timestamps */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted-foreground">
              Experience (Years)
            </label>
            <Input
              type="number"
              placeholder="0"
              {...register("experienceYears", { valueAsNumber: true })}
            />
            <FormError message={errors.experienceYears?.message} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted-foreground">
              Joined Date
            </label>
            <Input type="datetime-local" {...register("joinedAt")} />
            <FormError message={errors.joinedAt?.message} />
          </div>
        </div>

        {/* Ratings Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted-foreground">
              Average Rating
            </label>
            <Input
              type="number"
              step="0.1"
              placeholder="0.0"
              {...register("averageRating", { valueAsNumber: true })}
            />
            <FormError message={errors.averageRating?.message} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted-foreground">
              Total Reviews
            </label>
            <Input
              type="number"
              placeholder="0"
              {...register("totalReviews", { valueAsNumber: true })}
            />
            <FormError message={errors.totalReviews?.message} />
          </div>
        </div>

        {/* Social Media Links */}
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted-foreground">
              LinkedIn Profile
            </label>
            <Input placeholder="https://..." {...register("linkedInUrl")} />
            <FormError message={errors.linkedInUrl?.message} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted-foreground">
              YouTube Channel
            </label>
            <Input placeholder="https://..." {...register("youtubeUrl")} />
            <FormError message={errors.youtubeUrl?.message} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted-foreground">
              Instagram Handle
            </label>
            <Input placeholder="https://..." {...register("instagramUrl")} />
            <FormError message={errors.instagramUrl?.message} />
          </div>
        </div>

        {/* Assigned Courses Selection Grid */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-muted-foreground">
            Assigned Courses
          </label>
          {coursesLoading ? (
            <div className="text-xs text-neutral-400 italic">Loading courses context...</div>
          ) : !courses || courses.length === 0 ? (
            <div className="text-xs text-amber-500 border border-dashed border-amber-200 dark:border-amber-900/50 p-3 rounded-md bg-amber-50/50 dark:bg-amber-950/20 italic">
              No courses available in the database. Please create a course first.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border p-2.5 rounded-md bg-neutral-50 dark:bg-neutral-900">
              {courses.map((course) => {
                const isChecked = selectedCourseIds.includes(course.id);
                return (
                  <label
                    key={course.id}
                    className="flex items-center gap-2 text-sm text-foreground cursor-pointer select-none hover:opacity-80 transition-opacity"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleCourseToggle(course.id)}
                      className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4 accent-neutral-800"
                    />
                    <span className="truncate">{course.title}</span>
                  </label>
                );
              })}
            </div>
          )}
          <FormError message={errors.courseIds?.message} />
        </div>

        {/* Switches / Features */}
        <div className="flex items-center gap-3 py-2">
          <Switch
            checked={watch("isFeatured")}
            onCheckedChange={(value) => setValue("isFeatured", value)}
          />
          <label className="text-sm font-medium select-none cursor-pointer">
            Featured Trainer
          </label>
        </div>

        {/* Action Panel */}
        <div className="flex justify-end gap-3 pt-2 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {trainer ? "Update Trainer" : "Create Trainer"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}