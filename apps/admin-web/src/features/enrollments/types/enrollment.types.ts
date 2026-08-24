// src/features/enrollments/types/enrollment.types.ts

import {
  EnrollmentStatus,
  PaymentStatus,
  EnrollmentSource,
} from "./enrollment.enums";

export interface StudentInfo {
  id: string;
  studentCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  qualification: string | null;
  profileImageUrl: string | null;
  status: string;
  isActive: boolean;
}

export interface BranchInfo {
  id: string;
  branchName: string;
  branchCode: string;
}

export interface CategoryInfo {
  id: string;
  name: string;
  slug: string;
}

export interface CourseInfo {
  id: string;
  title: string;
  slug: string;
  tagline: string | null;
  shortDescription: string | null;
  duration: number;
  durationType: string;
  level: string;
  language: string;
  modes: string[];
  thumbnailUrl: string | null;
  status: string;
  averageRating: number;
  totalReviews: number;
  pricing?: {
    originalPrice: number;
    discountAmount: number;
    discountPercent: number;
    discountedPrice: number;
    currency: string;
    isFree: boolean;
  };
}

export interface TrainerInfo {
  id: string;
  firstName: string;
  lastName: string;
  employeeCode: string;
  email: string;
  phone: string;
  specialization: string | null;
}

export interface BatchInfo {
  id: string;
  name: string;
  code: string;
  slug: string;
  description: string | null;
  startDate: string;
  endDate: string;
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
  trainers: TrainerInfo[];
}

export interface Enrollment {
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

  admissionDate: string | null;
  joiningDate: string | null;
  expectedCompletionDate: string | null;

  remarks: string | null;

  isActive: boolean;
  isDeleted: boolean;
  deletedAt: string | null;

  student: StudentInfo;
  branch: BranchInfo;
  category: CategoryInfo;
  course: CourseInfo;
  batch: BatchInfo;

  createdAt: string;
  updatedAt: string;
}