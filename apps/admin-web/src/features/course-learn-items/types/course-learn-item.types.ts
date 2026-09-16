export interface ApiSuccessResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface CourseLearnItem {
  id: string;
  lessonId: string;
  title: string;
  explanation: string;
  imageUrl: string | null;
  keyLearningPoints: string | null;
  finalThoughts: string | null;
  summary: string | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CourseLearnItemFormValues {
  lessonId: string;
  title: string;
  explanation: string;
  imageUrl: string;
  keyLearningPoints: string[];
  finalThoughts: string;
  summary: string;
}

export interface CreateCourseLearnItemRequest {
  lessonId: string;
  title: string;
  explanation: string;
  imageUrl?: string | null;
  keyLearningPoints?: string[] | null;
  finalThoughts?: string | null;
  summary?: string | null;
}

export interface UpdateCourseLearnItemRequest {
  title?: string;
  explanation?: string;
  imageUrl?: string | null;
  keyLearningPoints?: string[] | null;
  finalThoughts?: string | null;
  summary?: string | null;
}

export interface MoveCourseLearnItemRequest {
  newPosition: number;
}

export interface CourseLearnItemFilters {
  lessonId: string;
  search?: string;
}
