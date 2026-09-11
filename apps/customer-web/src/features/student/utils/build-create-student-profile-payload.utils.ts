import type { UserProfile } from "@/src/features/auth/types/auth.types";

import type { CreateStudentProfilePayload } from "@/src/features/student/types";
import type { OptionalCreateStudentProfileFormValues } from "@/src/features/student/schemas/student-profile.schema";

function deriveFirstName(
  authUser: UserProfile,
  formFirstName?: string,
): string {
  const trimmed = formFirstName?.trim();

  if (trimmed) {
    return trimmed;
  }

  const accountName = authUser.name?.trim();

  if (!accountName) {
    return "Student";
  }

  return accountName.split(/\s+/)[0] || accountName;
}

export function buildOptionalCreateStudentProfilePayload(
  values: OptionalCreateStudentProfileFormValues,
  authUser: UserProfile,
): CreateStudentProfilePayload {
  const payload: CreateStudentProfilePayload = {
    firstName: deriveFirstName(authUser, values.firstName),
    email: authUser.email,
    phone: authUser.phone,
  };

  const optionalTextFields: Array<
    keyof OptionalCreateStudentProfileFormValues
  > = [
    "lastName",
    "dateOfBirth",
    "addressLine1",
    "addressLine2",
    "city",
    "state",
    "country",
    "postalCode",
    "qualification",
    "collegeName",
    "specialization",
    "emergencyContactName",
    "emergencyContactPhone",
  ];

  for (const field of optionalTextFields) {
    const value = values[field];

    if (typeof value === "string" && value.trim()) {
      Object.assign(payload, {
        [field]: value.trim(),
      });
    }
  }

  if (values.gender) {
    payload.gender = values.gender;
  }

  if (
    values.passingYear !== undefined &&
    values.passingYear !== ""
  ) {
    payload.passingYear = values.passingYear;
  }

  return payload;
}
