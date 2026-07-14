export type Gender =
  | "MALE"
  | "FEMALE"
  | "OTHER";

export interface StudentProfile {
  studentCode: string;

  firstName: string;

  lastName: string;

  email: string;

  phone: string;

  gender: Gender;

  dateOfBirth: string;

  addressLine1: string;

  addressLine2: string | null;

  city: string;

  state: string;

  country: string;

  postalCode: string;

  profileImageUrl: string | null;

  qualification: string;

  collegeName: string;

  specialization: string;

  passingYear: number;

  parentName: string;

  parentPhone: string;

  emergencyContactName: string;

  emergencyContactPhone: string;

  notes: string;

  status: string;

  isActive: boolean;
}

export interface CreateStudentProfileRequest {
  firstName: string;

  lastName: string;

  email: string;

  phone: string;

  gender: Gender;

  dateOfBirth: string;

  addressLine1: string;

  addressLine2?: string;

  city: string;

  state: string;

  country: string;

  postalCode: string;

  qualification: string;

  collegeName: string;

  specialization: string;

  passingYear: number;

  parentName: string;

  parentPhone: string;

  emergencyContactName: string;

  emergencyContactPhone: string;

  notes?: string;
}

export interface UpdateStudentProfileRequest {
  qualification?: string;

  collegeName?: string;

  specialization?: string;

  passingYear?: number;

  parentName?: string;

  parentPhone?: string;

  emergencyContactName?: string;

  emergencyContactPhone?: string;

  notes?: string;
}

export interface StudentProfileFormValues {
  firstName: string;

  lastName: string;

  email: string;

  phone: string;

  gender: Gender;

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

  passingYear: number;

  parentName: string;

  parentPhone: string;

  emergencyContactName: string;

  emergencyContactPhone: string;

  notes: string;
}