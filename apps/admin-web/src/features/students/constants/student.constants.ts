// src/features/students/constants/student.constants.ts

import type {
  StudentFilters,
  StudentGender,
  StudentStatus,
} from "@/src/features/students/types/student.types";
import { DELETED_STUDENTS_FILTER } from "@/src/features/students/utils/student-list.utils";
import type { StudentFormSchema } from "@/src/features/students/schemas/student.schema";

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
  ...STUDENT_STATUSES,
  { label: "Deleted", value: DELETED_STUDENTS_FILTER },
] as const;

export const DEFAULT_STUDENT_FILTERS: StudentFilters = {
  search: "",
  includeDeleted: false,
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
  branchId: "",
  notes: "",
  status: "LEAD",
  profileImageFileId: "",
};
