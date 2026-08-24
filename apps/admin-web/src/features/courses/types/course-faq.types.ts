export interface CourseFaq {
  id: string;
  courseId: string;
  question: string;
  answer: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseFaqRequest {
  question: string;
  answer: string;
}

export interface UpdateCourseFaqRequest {
  question: string;
  answer: string;
}

export interface ReorderCourseFaqsRequest {
  orderedIds: string[];
}

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}
