// src/features/students/types/student-form.types.ts

import {
  StudentGender,
  StudentStatus,
} from "@/src/features/students/types/student.types";

export interface StudentFormValues {
  firstName: string;

  lastName: string;

  email: string;

  phone: string;

  gender: StudentGender;

  dateOfBirth: string;

  addressLine1: string;

  addressLine2: string;

  city: string;

  state: string;

  country: string;

  postalCode: string;

  qualification: string;

  collegeName: string;

  specialization: string;

  passingYear?: number;

  parentName: string;

  parentPhone: string;

  emergencyContactName: string;

  emergencyContactPhone: string;

  admissionDate: string;

  branchId: string;

  notes: string;

  status: StudentStatus;
}