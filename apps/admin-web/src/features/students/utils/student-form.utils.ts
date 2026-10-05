import type { CreateStudentFormValues } from "@/src/features/students/schemas/create-student.schema";
import type {
  CreateStudentRequest,
  Student,
  UpdateStudentRequest,
} from "@/src/features/students/types/student.types";

export const NOTES_MAX_LENGTH = 4000;

const emptyToUndefined = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

export function formatStudentDate(value?: string | null): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function mapStudentToFormValues(student: Student): CreateStudentFormValues {
  return {
    studentCode: student.studentCode,
    firstName: student.firstName,
    lastName: student.lastName ?? "",
    email: student.email ?? "",
    phone: student.phone ?? "",
    gender: student.gender ?? "MALE",
    dateOfBirth: student.dateOfBirth?.split("T")[0] ?? "",
    addressLine1: student.addressLine1 ?? "",
    addressLine2: student.addressLine2 ?? "",
    city: student.city ?? "",
    state: student.state ?? "",
    country: student.country ?? "India",
    postalCode: student.postalCode ?? "",
    qualification: student.qualification ?? "",
    collegeName: student.collegeName ?? "",
    specialization: student.specialization ?? "",
    passingYear: student.passingYear ?? undefined,
    parentName: student.parentName ?? "",
    parentPhone: student.parentPhone ?? "",
    notes: student.notes ?? "",
    status: student.status,
    profileImageFileId: student.profileImageFileId ?? "",
  };
}

export function toCreateStudentRequest(
  values: CreateStudentFormValues,
): CreateStudentRequest {
  return {
    firstName: values.firstName.trim(),
    lastName: emptyToUndefined(values.lastName),
    email: values.email.trim(),
    phone: values.phone.trim(),
    gender: values.gender,
    dateOfBirth: emptyToUndefined(values.dateOfBirth),
    addressLine1: emptyToUndefined(values.addressLine1),
    addressLine2: emptyToUndefined(values.addressLine2),
    city: emptyToUndefined(values.city),
    state: emptyToUndefined(values.state),
    country: emptyToUndefined(values.country),
    postalCode: emptyToUndefined(values.postalCode),
    qualification: emptyToUndefined(values.qualification),
    collegeName: emptyToUndefined(values.collegeName),
    specialization: emptyToUndefined(values.specialization),
    passingYear:
      values.passingYear === undefined ||
      (typeof values.passingYear === "number" &&
        Number.isNaN(values.passingYear))
        ? undefined
        : values.passingYear,
    parentName: emptyToUndefined(values.parentName),
    parentPhone: emptyToUndefined(values.parentPhone),
    notes: emptyToUndefined(values.notes),
    status: "LEAD",
    profileImageFileId: emptyToUndefined(values.profileImageFileId),
  };
}

export function toUpdateStudentRequest(
  values: CreateStudentFormValues & { branchId?: string | null },
): UpdateStudentRequest {
  const createPayload = toCreateStudentRequest(values);
  const { status: _status, ...payloadWithoutStatus } = createPayload;

  return {
    ...payloadWithoutStatus,
    studentCode: values.studentCode?.trim() || undefined,
    ...(values.branchId !== undefined ? { branchId: values.branchId } : {}),
  };
}
