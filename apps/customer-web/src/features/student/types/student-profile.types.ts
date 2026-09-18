export type Gender =
  | "MALE"
  | "FEMALE"
  | "OTHER";

export interface StudentProfile {
  studentCode: string;

  firstName: string;

  lastName: string | null;

  email: string | null;

  phone: string | null;

  gender: Gender | null;

  dateOfBirth: string | null;

  addressLine1: string | null;

  addressLine2: string | null;

  city: string | null;

  state: string | null;

  country: string | null;

  postalCode: string | null;

  profileImageUrl: string | null;

  updatedAt?: string | null;

  qualification: string | null;

  collegeName: string | null;

  specialization: string | null;

  passingYear: number | null;

  parentName: string | null;

  parentPhone: string | null;

  emergencyContactName: string | null;

  emergencyContactPhone: string | null;

  notes: string | null;

  applicationType?: "OFFLINE" | "ONLINE";

  status: string;

  jobStatus: string | null;

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

export type CreateStudentProfilePayload = {
  firstName: string;
  email: string;
  phone: string;
} & Partial<
  Omit<
    CreateStudentProfileRequest,
    "firstName" | "email" | "phone"
  >
>;

export interface UpdateStudentProfileRequest {
  firstName?: string;
  lastName?: string | null;
  email?: string;
  phone?: string;
  gender?: Gender;
  dateOfBirth?: string | null;
  profileImageFileId?: string | null;
  addressLine1?: string;
  addressLine2?: string | null;
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