import { Enrollment } from '../entities/enrollment.entity';
import { EnrollmentSource } from '../enums/enrollment-source.enum';
import { EnrollmentStatus } from '../enums/enrollment-status.enum';
import { PaymentStatus } from '../enums/payment-status.enum';

export interface EnrollmentListFilters {
  search?: string;
  studentId?: string;
  branchId?: string;
  categoryId?: string;
  courseId?: string;
  batchId?: string;
  status?: EnrollmentStatus;
  currentOnly?: boolean;
  paymentStatus?: PaymentStatus;
  source?: EnrollmentSource;
  isActive?: boolean;
  includeDeleted?: boolean;
  admissionDateFrom?: Date;
  admissionDateTo?: Date;
  createdAtFrom?: Date;
  createdAtTo?: Date;
  skip?: number;
  take?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// =====================
// Read models (eagerly-loaded projections for response mapping)
// =====================

export interface EnrollmentStudentView {
  id: string;
  studentCode: string;
  firstName: string;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  gender: string | null;
  qualification: string | null;
  profileImageUrl: string | null;
  status: string;
  isActive: boolean;
}

export interface EnrollmentBranchView {
  id: string;
  branchName: string;
  branchCode: string;
}

export interface EnrollmentCategoryView {
  id: string;
  name: string;
  slug: string;
}

export interface CoursePricingView {
  originalPrice: number;
  discountAmount: number;
  discountPercent: number;
  discountedPrice: number;
  currency: string;
  isFree: boolean;
}

export interface EnrollmentCourseView {
  id: string;
  title: string;
  slug: string;
  tagline: string | null;
  shortDescription: string | null;
  duration: number | null;
  durationType: string | null;
  level: string;
  language: string;
  thumbnailUrl: string | null;
  status: string;
  averageRating: number;
  totalReviews: number;
  pricing: CoursePricingView;
}

export interface EnrollmentTrainerView {
  id: string;
  firstName: string;
  lastName: string | null;
  employeeCode: string | null;
  email: string | null;
  phone: string | null;
  specialization: string | null;
}

export interface EnrollmentBatchView {
  id: string;
  name: string;
  code: string;
  slug: string;
  description: string | null;
  startDate: Date;
  endDate: Date | null;
  startTime: string;
  endTime: string;
  daysOfWeek: string[];
  capacity: number;
  enrolledCount: number;
  mode: string;
  classroom: string | null;
  meetingLink: string | null;
  status: string;
  isFeatured: boolean;
  isActive: boolean;
  trainers: EnrollmentTrainerView[];
}

export interface EnrollmentDetailView {
  id: string;
  enrollmentNumber: string;
  status: EnrollmentStatus;
  paymentStatus: PaymentStatus;
  source: EnrollmentSource;
  feeAmount: number;
  discountAmount: number;
  finalAmount: number;
  paidAmount: number;
  dueAmount: number;
  admissionDate: Date | null;
  joiningDate: Date | null;
  expectedCompletionDate: Date | null;
  remarks: string | null;
  rejectionReason: string | null;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt: Date | null;
  student: EnrollmentStudentView;
  branch: EnrollmentBranchView;
  category: EnrollmentCategoryView;
  course: EnrollmentCourseView;
  batch: EnrollmentBatchView;
  createdAt: Date;
  updatedAt: Date;
}

export interface EnrollmentSummaryView {
  id: string;
  enrollmentNumber: string;
  status: EnrollmentStatus;
  paymentStatus: PaymentStatus;
  source: EnrollmentSource;
  feeAmount: number;
  discountAmount: number;
  finalAmount: number;
  paidAmount: number;
  dueAmount: number;
  isActive: boolean;
  admissionDate: Date | null;
  createdAt: Date;
  student: EnrollmentStudentView;
  branch: EnrollmentBranchView;
  category: EnrollmentCategoryView;
  course: Pick<EnrollmentCourseView, 'id' | 'title' | 'slug'>;
  batch: EnrollmentBatchView;
}

export interface EnrollmentRepository {
  save(enrollment: Enrollment): Promise<void>;
  findById(
    id: string,
    includeDeleted?: boolean,
  ): Promise<Enrollment | null>;
  findByEnrollmentNumber(
    enrollmentNumber: string,
    includeDeleted?: boolean,
  ): Promise<Enrollment | null>;
  findByStudentAndBatch(
    studentId: string,
    batchId: string,
    includeDeleted?: boolean,
  ): Promise<Enrollment | null>;
  findCurrentByStudentId(
    studentId: string,
    excludeId?: string,
  ): Promise<Enrollment | null>;
  findCurrentDetailByStudentId(
    studentId: string,
    excludeId?: string,
  ): Promise<EnrollmentDetailView | null>;
  findDetailById(
    id: string,
    includeDeleted?: boolean,
  ): Promise<EnrollmentDetailView | null>;
  findDetailsByStudentId(
    studentId: string,
    includeDeleted?: boolean,
  ): Promise<EnrollmentDetailView[]>;
  findAdmittedByStudentAndCourse(
    studentId: string,
    courseId: string,
    includeDeleted?: boolean,
  ): Promise<EnrollmentDetailView | null>;
  findSummaries(
    filters?: EnrollmentListFilters,
  ): Promise<EnrollmentSummaryView[]>;
  count(filters?: EnrollmentListFilters): Promise<number>;
  deletePermanent(id: string): Promise<void>;
}
