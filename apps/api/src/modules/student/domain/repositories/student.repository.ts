import { Student } from '../entities/student.entity';
import { StudentStatus } from '../enums/student-status.enum';

export interface StudentListFilters {
  branchId?: string;
  status?: StudentStatus;
  search?: string;
  includeDeleted?: boolean;
  onlyActive?: boolean;
  skip?: number;
  take?: number;
}

export interface StudentRepository {
  save(student: Student): Promise<void>;
  findById(
    id: string,
    includeDeleted?: boolean,
  ): Promise<Student | null>;
  findByEmail(
    email: string,
    includeDeleted?: boolean,
  ): Promise<Student | null>;
  findByPhone(
    phone: string,
    includeDeleted?: boolean,
  ): Promise<Student | null>;
  findByStudentCode(
    studentCode: string,
    includeDeleted?: boolean,
  ): Promise<Student | null>;
  findByCreatedBy(
    createdBy: string,
    includeDeleted?: boolean,
  ): Promise<Student | null>;
  findAll(filters?: StudentListFilters): Promise<Student[]>;
  deletePermanent(id: string): Promise<void>;
  findByUserId(
  userId: string,
  includeDeleted?: boolean,
): Promise<Student | null>;
}
