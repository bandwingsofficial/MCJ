export interface BatchCourseAssignmentRecord {
  id: string;
  batchId: string;
  courseId: string;
  trainerId: string;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  course: {
    id: string;
    title: string;
    code: string;
    tagline: string | null;
    shortDescription: string | null;
    description: string | null;
    thumbnailUrl: string | null;
    minimumQualifications: string[];
    isFree: boolean;
    currency: string;
    discountedPrice: unknown;
    originalPrice: unknown;
    category: {
      id: string;
      name: string;
    } | null;
  };
  trainer: {
    id: string;
    firstName: string;
    lastName: string | null;
    employeeCode: string | null;
    status: string;
    profileImageUrl: string | null;
    specialization: string | null;
    email: string | null;
    qualification: string | null;
  };
}
