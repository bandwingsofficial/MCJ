// src/features/students/types/student.dto.ts

import {
  Student,
} from "@/src/features/students/types/student.types";

export interface ApiResponse<T> {
  success: boolean;

  message: string;

  data: T;
}

export type GetStudentsResponse =
  ApiResponse<Student[]>;

export type GetStudentResponse =
  ApiResponse<Student>;

export type CreateStudentResponse =
  ApiResponse<Student>;

export type UpdateStudentResponse =
  ApiResponse<Student>;

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
  ApiResponse<DeleteStudentDto>;

export type PermanentDeleteStudentResponse =
  ApiResponse<PermanentDeleteStudentDto>;