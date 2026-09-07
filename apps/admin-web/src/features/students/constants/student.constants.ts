// src/features/students/constants/student.constants.ts

import type {
  StudentFilters,
  StudentGender,
  StudentStatus,
  StudentDocumentType,
} from "@/src/features/students/types/student.types";
import type { CreateStudentFormValues } from "@/src/features/students/schemas/create-student.schema";
import type { StudentFormSchema } from "@/src/features/students/schemas/student.schema";

export const ARCHIVED_STUDENTS_FILTER = "ARCHIVED" as const;
export const ACTIVE_STUDENTS_FILTER = "ACTIVE" as const;

/** @deprecated Use ARCHIVED_STUDENTS_FILTER */
export const DELETED_STUDENTS_FILTER = ARCHIVED_STUDENTS_FILTER;

export const STUDENT_GENDER_OPTIONS: ReadonlyArray<{
  label: string;
  value: StudentGender;
}> = [
  { label: "Male", value: "MALE" },
  { label: "Female", value: "FEMALE" },
  { label: "Other", value: "OTHER" },
];

export const STUDENT_STATUSES: ReadonlyArray<{
  label: string;
  value: StudentStatus;
}> = [
  { label: "Lead", value: "LEAD" },
  { label: "Enquired", value: "ENQUIRED" },
  { label: "Admitted", value: "ADMITTED" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Dropped", value: "DROPPED" },
  { label: "Placed", value: "PLACED" },
];

export const STUDENT_STATUS_FILTER_OPTIONS = [
  { label: "Active", value: ACTIVE_STUDENTS_FILTER },
  ...STUDENT_STATUSES,
  { label: "Archived", value: ARCHIVED_STUDENTS_FILTER },
] as const;

export const DEFAULT_STUDENT_FILTERS: StudentFilters = {
  search: "",
  includeDeleted: false,
  includeAll: true,
  page: 1,
  pageSize: 20,
};

export const DEFAULT_STUDENT_FORM_VALUES: StudentFormSchema = {
  studentCode: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  gender: "MALE",
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
  passingYear: undefined,
  parentName: "",
  parentPhone: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  admissionDate: "",
  notes: "",
  status: "LEAD",
  profileImageFileId: "",
};

export const DEFAULT_CREATE_STUDENT_FORM_VALUES: CreateStudentFormValues = {
  studentCode: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  gender: "MALE",
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
  passingYear: undefined,
  parentName: "",
  parentPhone: "",
  notes: "",
  status: "LEAD",
  profileImageFileId: "",
};

export const STUDENT_DOCUMENT_TYPE_OPTIONS: ReadonlyArray<{
  label: string;
  value: StudentDocumentType;
}> = [
  { label: "Marks Card", value: "MARKS_CARD" },
  { label: "Aadhaar", value: "AADHAAR" },
  { label: "ID Proof", value: "ID_PROOF" },
  { label: "Certificate", value: "CERTIFICATE" },
  { label: "Photo", value: "PHOTO" },
  { label: "Other", value: "OTHER" },
];
