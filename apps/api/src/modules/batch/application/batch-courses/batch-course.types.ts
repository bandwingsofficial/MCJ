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
  };
}
