import type { StudentFormSchema } from "@/src/features/students/schemas/student.schema";
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

export function mapStudentToFormValues(
  student: Student,
): Partial<StudentFormSchema> {
  return {
    studentCode: student.studentCode,
    firstName: student.firstName,
    lastName: student.lastName ?? "",
    email: student.email ?? "",
    phone: student.phone ?? "",
    gender: student.gender ?? undefined,
    dateOfBirth: student.dateOfBirth?.split("T")[0] ?? "",
    addressLine1: student.addressLine1 ?? "",
    addressLine2: student.addressLine2 ?? "",
    city: student.city ?? "",
    state: student.state ?? "",
    country: student.country ?? "",
    postalCode: student.postalCode ?? "",
    qualification: student.qualification ?? "",
    collegeName: student.collegeName ?? "",
    specialization: student.specialization ?? "",
    passingYear: student.passingYear ?? undefined,
    parentName: student.parentName ?? "",
    parentPhone: student.parentPhone ?? "",
    emergencyContactName: student.emergencyContactName ?? "",
    emergencyContactPhone: student.emergencyContactPhone ?? "",
    admissionDate: student.admissionDate?.split("T")[0] ?? "",
    notes: student.notes ?? "",
    status: student.status,
    profileImageFileId: student.profileImageFileId ?? "",
  };
}

export function toCreateStudentRequest(
  values: StudentFormSchema,
): CreateStudentRequest {
  return {
    firstName: values.firstName.trim(),
    lastName: emptyToUndefined(values.lastName),
    email: emptyToUndefined(values.email),
    phone: emptyToUndefined(values.phone),
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
    passingYear: values.passingYear,
    parentName: emptyToUndefined(values.parentName),
    parentPhone: emptyToUndefined(values.parentPhone),
    emergencyContactName: emptyToUndefined(values.emergencyContactName),
    emergencyContactPhone: emptyToUndefined(values.emergencyContactPhone),
    admissionDate: emptyToUndefined(values.admissionDate),
    notes: emptyToUndefined(values.notes),
    status: values.status,
    profileImageFileId: emptyToUndefined(values.profileImageFileId),
  };
}

export function toUpdateStudentRequest(
  values: StudentFormSchema & { branchId?: string | null },
): UpdateStudentRequest {
  const payload = toCreateStudentRequest(values);

  return {
    ...payload,
    studentCode: values.studentCode?.trim() || undefined,
    ...(values.branchId !== undefined ? { branchId: values.branchId } : {}),
  };
}
