export interface BatchCourseTrainerRecord {
  id: string;
  firstName: string;
  lastName: string | null;
  employeeCode: string | null;
  status: string;
  profileImageUrl: string | null;
  specialization: string | null;
  email: string | null;
  qualification: string | null;
}

export interface BatchCourseAssignmentRecord {
  id: string;
  batchId: string;
  courseId: string;
  trainerId: string | null;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  session: {
    id: string;
    number: number;
    code: string;
  } | null;
  course: {
    id: string;
    title: string;
    code: string;
    tagline: string | null;
    shortDescription: string | null;
    description: string | null;
    thumbnailUrl: string | null;
    minimumQualifications: string[];
    category: {
      id: string;
      name: string;
    } | null;
  };
  trainers: BatchCourseTrainerRecord[];
  trainer: BatchCourseTrainerRecord | null;
}
