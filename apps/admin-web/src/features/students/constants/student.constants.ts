// src/features/students/constants/student.constants.ts

import {
  CreateStudentRequest,
  StudentFilters,
  StudentGender,
  StudentStatus,
} from "@/src/features/students/types/student.types";

export const STUDENT_GENDER_OPTIONS: ReadonlyArray<{
  label: string;
  value: StudentGender;
}> = [
  {
    label: "Male",
    value: "MALE",
  },
  {
    label: "Female",
    value: "FEMALE",
  },
  {
    label: "Other",
    value: "OTHER",
  },
];

export const STUDENT_STATUS_OPTIONS: ReadonlyArray<{
  label: string;
  value: StudentStatus;
}> = [
  {
    label: "Lead",
    value: "LEAD",
  },
  {
    label: "Enquired",
    value: "ENQUIRED",
  },
  {
    label: "Admitted",
    value: "ADMITTED",
  },
  {
    label: "Active",
    value: "ACTIVE",
  },
  {
    label: "Inactive",
    value: "INACTIVE",
  },
  {
    label: "Completed",
    value: "COMPLETED",
  },
  {
    label: "Dropped",
    value: "DROPPED",
  },
  {
    label: "Placed",
    value: "PLACED",
  },
];

export const DEFAULT_STUDENT_FILTERS: StudentFilters = {
  search: "",
  includeDeleted: false,
};

export const DEFAULT_CREATE_STUDENT_VALUES: CreateStudentRequest =
  {
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
  };