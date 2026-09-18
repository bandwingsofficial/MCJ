"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { z } from "zod";

import { buildStudentQualificationSelectOptions } from "@mcj/shared-constants";

import { FormError } from "@/src/shared/components/ui/form-error";
import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";
import { AppSelect } from "@/src/shared/components/ui/select";
import { Skeleton } from "@/src/shared/components/ui/skeleton";

import type { UserProfile } from "@/src/features/auth/types/auth.types";
import { useCreateStudentProfile } from "@/src/features/student/hooks/useCreateStudentProfile";
import { useUpdateStudentProfile } from "@/src/features/student/hooks/useUpdateStudentProfile";
import { createStudentProfileSchema } from "@/src/features/student/schemas/student-profile.schema";
import type { StudentProfile } from "@/src/features/student/types";

const enrollmentStudentInfoSchema = z.object({
  firstName: createStudentProfileSchema.shape.firstName,
  lastName: z
    .string()
    .trim()
    .max(100, "Last name cannot exceed 100 characters.")
    .optional()
    .or(z.literal("")),
  email: createStudentProfileSchema.shape.email,
  phone: createStudentProfileSchema.shape.phone,
  qualification: z.string().trim().max(150).optional().or(z.literal("")),
  collegeName: z.string().trim().max(255).optional().or(z.literal("")),
  specialization: z.string().trim().max(255).optional().or(z.literal("")),
  parentName: z.string().trim().max(80).optional().or(z.literal("")),
  parentPhone: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => !value || /^\+?[1-9]\d{9,14}$/.test(value),
      "Please enter a valid phone number.",
    ),
  emergencyContactName: z
    .string()
    .trim()
    .max(80)
    .optional()
    .or(z.literal("")),
  emergencyContactPhone: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => !value || /^\+?[1-9]\d{9,14}$/.test(value),
      "Please enter a valid phone number.",
    ),
});

type EnrollmentStudentInfoValues = z.infer<typeof enrollmentStudentInfoSchema>;

export interface EnrollmentStudentInfoHandle {
  syncBeforePayment: () => Promise<boolean>;
}

interface EnrollmentStudentInfoProps {
  authUser: UserProfile | null;
  studentProfile: StudentProfile | null;
  isLoading: boolean;
  profileError: string | null;
  onProfileSynced?: () => void;
}

function splitAuthName(name?: string | null): {
  firstName: string;
  lastName: string;
} {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (parts.length === 0) {
    return { firstName: "", lastName: "" };
  }
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

export const EnrollmentStudentInfo = forwardRef<
  EnrollmentStudentInfoHandle,
  EnrollmentStudentInfoProps
>(function EnrollmentStudentInfo(
  {
    authUser,
    studentProfile,
    isLoading,
    profileError,
    onProfileSynced,
  },
  ref,
) {
  const {
    createProfile,
    isSubmitting: isCreating,
    error: createError,
  } = useCreateStudentProfile();
  const {
    updateProfile,
    isSubmitting: isUpdating,
    error: updateError,
  } = useUpdateStudentProfile();

  const defaults = useMemo((): EnrollmentStudentInfoValues => {
    if (studentProfile) {
      return {
        firstName: studentProfile.firstName ?? "",
        lastName: studentProfile.lastName ?? "",
        email: studentProfile.email ?? authUser?.email ?? "",
        phone: studentProfile.phone ?? authUser?.phone ?? "",
        qualification: studentProfile.qualification ?? "",
        collegeName: studentProfile.collegeName ?? "",
        specialization: studentProfile.specialization ?? "",
        parentName: studentProfile.parentName ?? "",
        parentPhone: studentProfile.parentPhone ?? "",
        emergencyContactName: studentProfile.emergencyContactName ?? "",
        emergencyContactPhone: studentProfile.emergencyContactPhone ?? "",
      };
    }

    const fromAuth = splitAuthName(authUser?.name);
    return {
      firstName: fromAuth.firstName,
      lastName: fromAuth.lastName,
      email: authUser?.email ?? "",
      phone: authUser?.phone ?? "",
      qualification: "",
      collegeName: "",
      specialization: "",
      parentName: "",
      parentPhone: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
    };
  }, [authUser, studentProfile]);

  const [values, setValues] =
    useState<EnrollmentStudentInfoValues>(defaults);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof EnrollmentStudentInfoValues, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setValues(defaults);
    setFieldErrors({});
    setFormError(null);
  }, [defaults]);

  const hasProfile = Boolean(studentProfile);
  const personalLocked = hasProfile;
  const isSubmitting = isCreating || isUpdating;

  const updateField = (
    field: keyof EnrollmentStudentInfoValues,
    value: string,
  ) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    setFormError(null);
  };

  const syncBeforePayment = async (): Promise<boolean> => {
    const parsed = enrollmentStudentInfoSchema.safeParse(values);
    if (!parsed.success) {
      const nextErrors: Partial<
        Record<keyof EnrollmentStudentInfoValues, string>
      > = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof EnrollmentStudentInfoValues;
        if (key && !nextErrors[key]) {
          nextErrors[key] = issue.message;
        }
      });
      setFieldErrors(nextErrors);
      setFormError("Please complete the required student information.");
      return false;
    }

    try {
      if (!hasProfile) {
        await createProfile({
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName?.trim() || undefined,
          email: parsed.data.email,
          phone: parsed.data.phone,
          qualification: parsed.data.qualification?.trim() || undefined,
          collegeName: parsed.data.collegeName?.trim() || undefined,
          specialization: parsed.data.specialization?.trim() || undefined,
          parentName: parsed.data.parentName?.trim() || undefined,
          parentPhone: parsed.data.parentPhone?.trim() || undefined,
          emergencyContactName:
            parsed.data.emergencyContactName?.trim() || undefined,
          emergencyContactPhone:
            parsed.data.emergencyContactPhone?.trim() || undefined,
        });
      } else {
        await updateProfile({
          qualification: parsed.data.qualification?.trim() || undefined,
          collegeName: parsed.data.collegeName?.trim() || undefined,
          specialization: parsed.data.specialization?.trim() || undefined,
          parentName: parsed.data.parentName?.trim() || undefined,
          parentPhone: parsed.data.parentPhone?.trim() || undefined,
          emergencyContactName:
            parsed.data.emergencyContactName?.trim() || undefined,
          emergencyContactPhone:
            parsed.data.emergencyContactPhone?.trim() || undefined,
        });
      }

      setFormError(null);
      onProfileSynced?.();
      return true;
    } catch {
      setFormError(
        createError ||
          updateError ||
          "Could not save student information. Please try again.",
      );
      return false;
    }
  };

  useImperativeHandle(ref, () => ({
    syncBeforePayment,
  }));

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <Skeleton className="h-6 w-44" />
        <div className="mt-4 space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h3 className="text-base font-semibold text-slate-900">
        Student Information
      </h3>
      <p className="mt-1 text-sm text-slate-500">
        {hasProfile
          ? "Review your details below. Required fields must be complete before payment."
          : "Enter the required student details to continue with enrollment."}
      </p>

      {profileError && !hasProfile ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          We could not load an existing student profile. Complete the form
          below to continue.
        </div>
      ) : null}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="enrollment-first-name">
            First Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="enrollment-first-name"
            className="mt-1.5"
            value={values.firstName}
            disabled={personalLocked || isSubmitting}
            onChange={(event) => updateField("firstName", event.target.value)}
            autoComplete="given-name"
          />
          {fieldErrors.firstName ? (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.firstName}</p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="enrollment-last-name">Last Name</Label>
          <Input
            id="enrollment-last-name"
            className="mt-1.5"
            value={values.lastName ?? ""}
            disabled={personalLocked || isSubmitting}
            onChange={(event) => updateField("lastName", event.target.value)}
            autoComplete="family-name"
          />
        </div>

        <div>
          <Label htmlFor="enrollment-email">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="enrollment-email"
            type="email"
            className="mt-1.5"
            value={values.email}
            disabled={personalLocked || isSubmitting}
            onChange={(event) => updateField("email", event.target.value)}
            autoComplete="email"
          />
          {fieldErrors.email ? (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="enrollment-phone">
            Phone <span className="text-red-500">*</span>
          </Label>
          <Input
            id="enrollment-phone"
            className="mt-1.5"
            value={values.phone}
            disabled={personalLocked || isSubmitting}
            onChange={(event) => updateField("phone", event.target.value)}
            autoComplete="tel"
          />
          {fieldErrors.phone ? (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="enrollment-qualification">Qualification</Label>
          <AppSelect
            value={values.qualification || undefined}
            placeholder="Select qualification"
            disabled={isSubmitting}
            options={buildStudentQualificationSelectOptions(
              values.qualification,
            )}
            onValueChange={(value) => updateField("qualification", value)}
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="enrollment-college">College / Institution</Label>
          <Input
            id="enrollment-college"
            className="mt-1.5"
            value={values.collegeName ?? ""}
            disabled={isSubmitting}
            onChange={(event) => updateField("collegeName", event.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="enrollment-specialization">Specialization</Label>
          <Input
            id="enrollment-specialization"
            className="mt-1.5"
            value={values.specialization ?? ""}
            disabled={isSubmitting}
            onChange={(event) =>
              updateField("specialization", event.target.value)
            }
          />
        </div>

        <div>
          <Label htmlFor="enrollment-parent-name">Parent / Guardian Name</Label>
          <Input
            id="enrollment-parent-name"
            className="mt-1.5"
            value={values.parentName ?? ""}
            disabled={isSubmitting}
            onChange={(event) => updateField("parentName", event.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="enrollment-parent-phone">Parent / Guardian Phone</Label>
          <Input
            id="enrollment-parent-phone"
            className="mt-1.5"
            value={values.parentPhone ?? ""}
            disabled={isSubmitting}
            onChange={(event) => updateField("parentPhone", event.target.value)}
          />
          {fieldErrors.parentPhone ? (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.parentPhone}</p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="enrollment-emergency-name">Emergency Contact</Label>
          <Input
            id="enrollment-emergency-name"
            className="mt-1.5"
            value={values.emergencyContactName ?? ""}
            disabled={isSubmitting}
            onChange={(event) =>
              updateField("emergencyContactName", event.target.value)
            }
          />
        </div>

        <div>
          <Label htmlFor="enrollment-emergency-phone">
            Emergency Contact Phone
          </Label>
          <Input
            id="enrollment-emergency-phone"
            className="mt-1.5"
            value={values.emergencyContactPhone ?? ""}
            disabled={isSubmitting}
            onChange={(event) =>
              updateField("emergencyContactPhone", event.target.value)
            }
          />
          {fieldErrors.emergencyContactPhone ? (
            <p className="mt-1 text-xs text-red-600">
              {fieldErrors.emergencyContactPhone}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-4">
        <FormError message={formError ?? createError ?? updateError ?? undefined} />
      </div>
    </section>
  );
});
