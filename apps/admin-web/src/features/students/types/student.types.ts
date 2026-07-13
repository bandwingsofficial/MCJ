// src/features/students/types/student.types.ts

export type StudentGender =
  | "MALE"
  | "FEMALE"
  | "OTHER";

export type StudentStatus =
  | "LEAD"
  | "ENQUIRED"
  | "ADMITTED"
  | "ACTIVE"
  | "INACTIVE"
  | "COMPLETED"
  | "DROPPED"
  | "PLACED";

export interface Student {
  id: string;

  firstName: string;

  lastName: string;

  email: string;

  phone: string;

  gender: StudentGender;

  dateOfBirth: string;

  addressLine1: string | null;

  addressLine2: string | null;

  city: string | null;

  state: string | null;

  country: string | null;

  postalCode: string | null;

  profileImageFileId: string | null;

  profileImageUrl: string | null;

  qualification: string | null;

  collegeName: string | null;

  specialization: string | null;

  passingYear: number | null;

  parentName: string | null;

  parentPhone: string | null;

  emergencyContactName: string | null;

  emergencyContactPhone: string | null;

  studentCode: string;

  admissionDate: string;

  branchId: string;

  notes: string | null;

  status: StudentStatus;

  isActive: boolean;

  isDeleted: boolean;

  deletedAt: string | null;

  createdBy: string;

  updatedBy: string | null;

  createdAt: string;

  updatedAt: string;
}

export interface StudentFilters {
  search: string;

  includeDeleted: boolean;

  status?: StudentStatus;

  gender?: StudentGender;

  branchId?: string;
}

export interface CreateStudentRequest {
  firstName: string;
  profileImageFileId?: string;
  lastName: string;

  email: string;

  phone: string;

  gender: StudentGender;

  dateOfBirth: string;

  addressLine1?: string;

  addressLine2?: string;

  city?: string;

  state?: string;

  country?: string;

  postalCode?: string;

  qualification?: string;

  collegeName?: string;

  specialization?: string;

  passingYear?: number;

  parentName?: string;

  parentPhone?: string;

  emergencyContactName?: string;

  emergencyContactPhone?: string;

  admissionDate: string;

  branchId: string;

  notes?: string;

  status: StudentStatus;
}

export interface UpdateStudentRequest
  extends CreateStudentRequest {
  studentCode?: string;
}

export interface StudentListResponse {
  items: Student[];

  count: number;
}

export interface StudentResponse {
  data: Student;
}