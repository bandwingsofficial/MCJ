import type {
  ApiSuccessResponse,
  Student,
  StudentListResponse,
} from "@/src/features/students/types/student.types";

export type GetStudentsResponse =
  ApiSuccessResponse<StudentListResponse | Student[]>;

export type GetStudentResponse = ApiSuccessResponse<Student>;

export type CreateStudentResponse = ApiSuccessResponse<Student>;

export type UpdateStudentResponse = ApiSuccessResponse<Student>;

export interface DeleteStudentDto {
  id: string;
  deleted: boolean;
  deletedAt: string;
}

export interface PermanentDeleteStudentDto {
  id: string;
  permanentlyDeleted: boolean;
}

export type DeleteStudentResponse =
  ApiSuccessResponse<DeleteStudentDto>;

export type PermanentDeleteStudentResponse =
  ApiSuccessResponse<PermanentDeleteStudentDto>;
