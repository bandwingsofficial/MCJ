"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type FieldValues, type Path, type UseFormRegister, type UseFormSetValue, type UseFormWatch } from "react-hook-form";

import { useAuthStore } from "@/src/features/auth/store/auth.store";
import { appToast } from "@/src/shared/components/ui/toast";
import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { cn } from "@/src/shared/lib/cn";
import { FormError } from "@/src/shared/components/ui/form-error";
import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";
import { Textarea } from "@/src/shared/components/ui/textarea";
import { AppSelect } from "@/src/shared/components/ui/select";
import { GENDER_OPTIONS } from "@/src/features/student/constants";
import {
  createStudentProfileSchema,
  optionalCreateStudentProfileSchema,
  type CreateStudentProfileFormValues,
  type OptionalCreateStudentProfileFormValues,
} from "@/src/features/student/schemas";
import {
  useCreateStudentProfile,
  useStudentProfile,
  useUpdateStudentProfile,
} from "@/src/features/student/hooks";
import { buildOptionalCreateStudentProfilePayload } from "@/src/features/student/utils/build-create-student-profile-payload.utils";
import type { StudentProfile } from "@/src/features/student/types";

interface StudentProfileFormProps {
  isEditing?: boolean;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export function StudentProfileForm(props: StudentProfileFormProps) {
  const { profile } = useStudentProfile();

  if (profile) {
    return (
      <UpdateStudentProfileForm profile={profile} {...props} />
    );
  }

  return <CreateStudentProfileForm {...props} />;
}

function CreateStudentProfileForm({
  onCancel,
  onSuccess,
}: Pick<StudentProfileFormProps, "onCancel" | "onSuccess">) {
  const authUser = useAuthStore((state) => state.user);
  const { refetch } = useStudentProfile();
  const { createProfile, isSubmitting } = useCreateStudentProfile();

  const form = useForm<OptionalCreateStudentProfileFormValues>({
    resolver: zodResolver(
      optionalCreateStudentProfileSchema,
    ) as never,
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      gender: undefined,
      dateOfBirth: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      country: "India",
      postalCode: "",
      qualification: "",
      collegeName: "",
      specialization: "",
      passingYear: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
    },
  });

  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;

  useEffect(() => {
    if (!authUser) {
      return;
    }

    setValue("email", authUser.email);
    setValue("phone", authUser.phone);

    if (authUser.name) {
      const [firstName, ...rest] = authUser.name.trim().split(/\s+/);

      if (firstName) {
        setValue("firstName", firstName);
      }

      if (rest.length > 0) {
        setValue("lastName", rest.join(" "));
      }
    }
  }, [authUser, setValue]);

  return (
    <ProfileFormShell
      embeddedInModal
      submitLabel="Create Profile"
      isSubmitting={isSubmitting}
      onCancel={onCancel}
      onSubmit={form.handleSubmit(async (values) => {
        try {
          if (!authUser) {
            throw new Error(
              "Please sign in again to create your student profile.",
            );
          }

          await createProfile(
            buildOptionalCreateStudentProfilePayload(values, authUser),
          );
          appToast.success("Profile created successfully.");
          await refetch();
          onSuccess?.();
        } catch (error) {
          appToast.error(
            error instanceof Error
              ? error.message
              : "Failed to save profile.",
          );
        }
      })}
    >
      <PersonalFields
        errors={errors}
        register={register}
        watch={watch}
        setValue={setValue}
        isCreateMode
      />
      <AddressFields errors={errors} register={register} isCreateMode />
      <EducationFields errors={errors} register={register} isCreateMode />
      <EmergencyContactFields
        errors={errors}
        register={register}
        isCreateMode
      />
    </ProfileFormShell>
  );
}

function UpdateStudentProfileForm({
  profile,
  isEditing = true,
  onCancel,
  onSuccess,
}: StudentProfileFormProps & { profile: StudentProfile }) {
  const { refetch } = useStudentProfile();
  const { updateProfile, isSubmitting } = useUpdateStudentProfile();

  const form = useForm<CreateStudentProfileFormValues>({
    resolver: zodResolver(createStudentProfileSchema),
    defaultValues: {
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: profile.phone,
      gender: profile.gender,
      dateOfBirth: profile.dateOfBirth.split("T")[0],
      addressLine1: profile.addressLine1,
      addressLine2: profile.addressLine2 ?? "",
      city: profile.city,
      state: profile.state,
      country: profile.country,
      postalCode: profile.postalCode,
      qualification: profile.qualification,
      collegeName: profile.collegeName,
      specialization: profile.specialization,
      passingYear: profile.passingYear,
      parentName: profile.parentName,
      parentPhone: profile.parentPhone,
      emergencyContactName: profile.emergencyContactName,
      emergencyContactPhone: profile.emergencyContactPhone,
      notes: profile.notes ?? "",
    },
  });

  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;

  return (
    <ProfileFormShell
      title={
        isEditing ? "Update Student Profile" : "Student Profile"
      }
      description={
        isEditing
          ? "Update your profile information."
          : "Review your profile information."
      }
      submitLabel="Save Changes"
      isSubmitting={isSubmitting}
      onCancel={isEditing ? onCancel : undefined}
      onSubmit={form.handleSubmit(async (values) => {
        try {
          await updateProfile({
            qualification: values.qualification,
            collegeName: values.collegeName,
            specialization: values.specialization,
            passingYear: values.passingYear,
            parentName: values.parentName,
            parentPhone: values.parentPhone,
            emergencyContactName: values.emergencyContactName,
            emergencyContactPhone: values.emergencyContactPhone,
            notes: values.notes,
          });
          appToast.success("Profile updated successfully.");
          await refetch();
          onSuccess?.();
        } catch (error) {
          appToast.error(
            error instanceof Error
              ? error.message
              : "Failed to save profile.",
          );
        }
      })}
    >
      <PersonalFields
        errors={errors}
        register={register}
        watch={watch}
        setValue={setValue}
      />
      <AddressFields errors={errors} register={register} />
      <EducationFields errors={errors} register={register} />
      <ParentFields errors={errors} register={register} />
      <EmergencyContactFields errors={errors} register={register} />
      <section className="space-y-3">
        <h3 className="border-b pb-1 text-base font-semibold">
          Additional Notes
        </h3>
        <Textarea
          {...register("notes")}
          rows={3}
          placeholder="Additional information..."
        />
        <FormError message={errors.notes?.message as string} />
      </section>
    </ProfileFormShell>
  );
}

function ProfileFormShell({
  title,
  description,
  submitLabel,
  isSubmitting,
  onSubmit,
  onCancel,
  embeddedInModal = false,
  children,
}: {
  title?: string;
  description?: string;
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  onCancel?: () => void;
  embeddedInModal?: boolean;
  children: React.ReactNode;
}) {
  const formContent = (
    <form
      className={cn(
        embeddedInModal
          ? "flex min-h-0 flex-1 flex-col"
          : "space-y-6",
      )}
      onSubmit={onSubmit}
    >
      {!embeddedInModal && title ? (
        <div className="mb-6">
          <h2 className="text-xl font-semibold">{title}</h2>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      ) : null}

      <div
        className={cn(
          embeddedInModal
            ? "min-h-0 flex-1 space-y-6 overflow-y-auto pr-1"
            : "space-y-6",
        )}
      >
        {children}
      </div>

      <div className="mt-4 flex shrink-0 justify-end gap-3 border-t border-slate-100 bg-white pt-4">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button
          type="submit"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );

  if (embeddedInModal) {
    return formContent;
  }

  return (
    <div className="mx-auto my-8 w-full max-w-4xl px-4">
      <Card className="overflow-y-auto p-5 shadow-sm md:p-6">
        {formContent}
      </Card>
    </div>
  );
}

function PersonalFields<T extends FieldValues>({
  errors,
  register,
  watch,
  setValue,
  isCreateMode = false,
}: {
  errors: Record<string, { message?: string } | undefined>;
  register: UseFormRegister<T>;
  watch: UseFormWatch<T>;
  setValue: UseFormSetValue<T>;
  isCreateMode?: boolean;
}) {
  return (
    <section className="space-y-3">
      <h3 className="border-b pb-1 text-base font-semibold">
        Personal Information
      </h3>
      <div className="grid gap-4 md:grid-cols-2">
        {(
          [
            { label: "First Name", id: "firstName" },
            { label: "Last Name", id: "lastName" },
          ] as const
        ).map((field) => (
          <div key={field.id}>
            <Label required={!isCreateMode}>{field.label}</Label>
            <Input
              {...register(field.id as Path<T>)}
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
            <FormError message={errors[field.id]?.message as string} />
          </div>
        ))}

        {(
          [
            { label: "Email", id: "email", type: "email" },
            { label: "Phone Number", id: "phone", type: "tel" },
          ] as const
        ).map((field) => (
          <div key={field.id}>
            <Label required={!isCreateMode}>{field.label}</Label>
            {isCreateMode ? (
              <>
                <input type="hidden" {...register(field.id as Path<T>)} />
                <Input
                  type={field.type}
                  value={String(watch(field.id as Path<T>) ?? "")}
                  readOnly
                  disabled
                  tabIndex={-1}
                />
              </>
            ) : (
              <Input type={field.type} {...register(field.id as Path<T>)} />
            )}
            <FormError message={errors[field.id]?.message as string} />
          </div>
        ))}

        <div>
          <Label required={!isCreateMode}>Gender</Label>
          <AppSelect
            value={String(watch("gender" as Path<T>) ?? "")}
            options={GENDER_OPTIONS}
            onValueChange={(value) =>
              setValue(
                "gender" as Path<T>,
                value as never,
                { shouldValidate: true },
              )
            }
          />
          <FormError message={errors.gender?.message as string} />
        </div>

        <div>
          <Label required={!isCreateMode}>Date of Birth</Label>
          <Input type="date" {...register("dateOfBirth" as Path<T>)} />
          <FormError message={errors.dateOfBirth?.message as string} />
        </div>
      </div>
    </section>
  );
}

function AddressFields<T extends FieldValues>({
  errors,
  register,
  isCreateMode = false,
}: {
  errors: Record<string, { message?: string } | undefined>;
  register: UseFormRegister<T>;
  isCreateMode?: boolean;
}) {
  return (
    <section className="space-y-3">
      <h3 className="border-b pb-1 text-base font-semibold">
        Address Information
      </h3>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <Label required={!isCreateMode}>Address Line 1</Label>
          <Input {...register("addressLine1" as Path<T>)} />
          <FormError message={errors.addressLine1?.message as string} />
        </div>
        <div className="md:col-span-2">
          <Label>Address Line 2</Label>
          <Input {...register("addressLine2" as Path<T>)} />
          <FormError message={errors.addressLine2?.message as string} />
        </div>
        {(["city", "state", "country", "postalCode"] as const).map(
          (field) => (
            <div key={field}>
              <Label required={!isCreateMode}>
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </Label>
              <Input {...register(field as Path<T>)} />
              <FormError message={errors[field]?.message as string} />
            </div>
          ),
        )}
      </div>
    </section>
  );
}

function EducationFields<T extends FieldValues>({
  errors,
  register,
  isCreateMode = false,
}: {
  errors: Record<string, { message?: string } | undefined>;
  register: UseFormRegister<T>;
  isCreateMode?: boolean;
}) {
  return (
    <section className="space-y-3">
      <h3 className="border-b pb-1 text-base font-semibold">
        Education Details
      </h3>
      <div className="grid gap-4 md:grid-cols-2">
        {(
          [
            "qualification",
            "collegeName",
            "specialization",
            "passingYear",
          ] as const
        ).map((field) => (
          <div key={field}>
            <Label required={!isCreateMode}>
              {field
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (value) => value.toUpperCase())}
            </Label>
            <Input
              type={field === "passingYear" && !isCreateMode ? "number" : "text"}
              {...register(field as Path<T>)}
            />
            <FormError message={errors[field]?.message as string} />
          </div>
        ))}
      </div>
    </section>
  );
}

function ParentFields<T extends FieldValues>({
  errors,
  register,
}: {
  errors: Record<string, { message?: string } | undefined>;
  register: UseFormRegister<T>;
}) {
  return (
    <section className="space-y-3">
      <h3 className="border-b pb-1 text-base font-semibold">
        Parent / Guardian Details
      </h3>
      <div className="grid gap-4 md:grid-cols-2">
        {(["parentName", "parentPhone"] as const).map((field) => (
          <div key={field}>
            <Label required>
              {field
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (value) => value.toUpperCase())}
            </Label>
            <Input {...register(field as Path<T>)} />
            <FormError message={errors[field]?.message as string} />
          </div>
        ))}
      </div>
    </section>
  );
}

function EmergencyContactFields<T extends FieldValues>({
  errors,
  register,
  isCreateMode = false,
}: {
  errors: Record<string, { message?: string } | undefined>;
  register: UseFormRegister<T>;
  isCreateMode?: boolean;
}) {
  return (
    <section className="space-y-3">
      <h3 className="border-b pb-1 text-base font-semibold">
        Emergency Contact
      </h3>
      <div className="grid gap-4 md:grid-cols-2">
        {(["emergencyContactName", "emergencyContactPhone"] as const).map(
          (field) => (
            <div key={field}>
              <Label required={!isCreateMode}>
                {field
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (value) => value.toUpperCase())}
              </Label>
              <Input {...register(field as Path<T>)} />
              <FormError message={errors[field]?.message as string} />
            </div>
          ),
        )}
      </div>
    </section>
  );
}
