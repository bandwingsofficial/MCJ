import type { StudentProfile } from "@/src/features/student/types";

/** Coerce nullable API strings into form-safe empty strings (never the literal "null"). */
export function toFormString(
  value: string | null | undefined,
): string {
  if (value == null) {
    return "";
  }

  const trimmed = String(value).trim();
  if (!trimmed || trimmed.toLowerCase() === "null") {
    return "";
  }

  return trimmed;
}

/**
 * Convert API/DB date values into YYYY-MM-DD for `<input type="date">`.
 * Browser locales (e.g. en-IN) display this as dd-mm-yyyy with the calendar picker.
 * Never calls string methods on null/undefined.
 */
export function toFormDateInputValue(
  value: string | Date | null | undefined,
): string {
  if (value == null || value === "") {
    return "";
  }

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return "";
    }

    const year = value.getUTCFullYear();
    const month = String(value.getUTCMonth() + 1).padStart(2, "0");
    const day = String(value.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const raw = toFormString(value);
  if (!raw) {
    return "";
  }

  // ISO datetime: 2000-05-10T00:00:00.000Z
  if (raw.includes("T")) {
    const datePart = raw.slice(0, raw.indexOf("T"));
    return /^\d{4}-\d{2}-\d{2}$/.test(datePart) ? datePart : "";
  }

  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return raw;
  }

  // Fallback parse without throwing on invalid values
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return toFormDateInputValue(parsed);
}

/** Normalize form date input (YYYY-MM-DD) for the Student API payload. */
export function toApiDateOfBirth(
  value: string | null | undefined,
): string | null {
  const normalized = toFormDateInputValue(value);
  return normalized || null;
}

export function formatStudentFullName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
): string {
  return [toFormString(firstName), toFormString(lastName)]
    .filter(Boolean)
    .join(" ");
}

export function mapStudentProfileToFormValues(profile: StudentProfile) {
  return {
    firstName: toFormString(profile.firstName),
    lastName: toFormString(profile.lastName),
    email: toFormString(profile.email),
    phone: toFormString(profile.phone),
    gender: profile.gender ?? undefined,
    dateOfBirth: toFormDateInputValue(profile.dateOfBirth),
    addressLine1: toFormString(profile.addressLine1),
    addressLine2: toFormString(profile.addressLine2),
    city: toFormString(profile.city),
    state: toFormString(profile.state),
    country: toFormString(profile.country) || "India",
    postalCode: toFormString(profile.postalCode),
    qualification: toFormString(profile.qualification),
    collegeName: toFormString(profile.collegeName),
    specialization: toFormString(profile.specialization),
    passingYear: profile.passingYear ?? ("" as unknown as number),
    parentName: toFormString(profile.parentName),
    parentPhone: toFormString(profile.parentPhone),
    emergencyContactName: toFormString(profile.emergencyContactName),
    emergencyContactPhone: toFormString(profile.emergencyContactPhone),
    notes: toFormString(profile.notes),
  };
}
