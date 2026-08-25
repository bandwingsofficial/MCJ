// src/features/students/types/student.types.ts

export type StudentGender = "MALE" | "FEMALE" | "OTHER";

export type StudentStatus =
  | "LEAD"
  | "ENQUIRED"
  | "ADMITTED"
  | "COMPLETED"
  | "DROPPED"
  | "PLACED";

export type StudentDocumentType =
  | "MARKS_CARD"
  | "AADHAAR"
  | "ID_PROOF"
  | "CERTIFICATE"
  | "PHOTO"
  | "OTHER";

export type StudentDocumentStatus = "UPLOADED";

export interface Student {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  gender: StudentGender | null;
  dateOfBirth: string | null;
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
  admissionDate: string | null;
  branchId?: string | null;
  notes: string | null;
  status: StudentStatus;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StudentFilters {
  search?: string;
  includeDeleted?: boolean;
  onlyActive?: boolean;
  status?: StudentStatus;
  gender?: StudentGender;
  branchId?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateStudentRequest {
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  gender?: StudentGender;
  dateOfBirth?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  profileImageFileId?: string;
  qualification?: string;
  collegeName?: string;
  specialization?: string;
  passingYear?: number;
  parentName?: string;
  parentPhone?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  admissionDate?: string;
  branchId?: string | null;
  notes?: string;
  status?: StudentStatus;
}

export interface UpdateStudentRequest extends CreateStudentRequest {
  studentCode?: string;
  branchId?: string | null;
}

export interface StudentListResponse {
  items: Student[];
  count: number;
}

export type StudentListItem = Student;

export interface BranchOption {
  id: string;
  branchName: string;
  branchCode: string;
}

export interface SuggestStudentCodeResponse {
  studentCode: string;
}

export interface BulkStudentItemResult {
  studentId: string;
  success: boolean;
  message: string;
  isActive?: boolean;
}

export interface BulkStudentOperationResult {
  requestedCount: number;
  processedCount: number;
  successCount: number;
  failedCount: number;
  results: BulkStudentItemResult[];
  failures: BulkStudentItemResult[];
}

export interface ApiSuccessResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface StudentDocument {
  id: string;
  studentId: string;
  name: string;
  type: StudentDocumentType;
  description: string | null;
  fileId: string;
  fileName: string | null;
  fileSize: number | null;
  fileUrl: string | null;
  mimeType: string | null;
  status: StudentDocumentStatus;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStudentDocumentRequest {
  name: string;
  type: StudentDocumentType;
  fileId: string;
  description?: string;
}

export interface UpdateStudentDocumentRequest {
  name?: string;
  type?: StudentDocumentType;
  fileId?: string;
  description?: string;
}
