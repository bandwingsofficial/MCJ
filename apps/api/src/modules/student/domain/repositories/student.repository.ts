import { Student } from '../entities/student.entity';
import { StudentStatus } from '../enums/student-status.enum';

export interface StudentAdmittedEnrollmentBlock {
  studentId: string;
  studentName: string;
  enrollmentId: string;
  branchId: string;
  branchName: string;
  courseId: string;
  courseTitle: string;
  status: string;
}

export interface StudentListFilters {
  branchId?: string;
  status?: StudentStatus;
  search?: string;
  includeDeleted?: boolean;
  includeAll?: boolean;
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
  count(filters?: StudentListFilters): Promise<number>;
  getMaxStudentCodeNumber(): Promise<number>;
  deletePermanent(id: string): Promise<void>;

  findAdmittedEnrollmentBlocksByStudentIds(
    studentIds: string[],
  ): Promise<StudentAdmittedEnrollmentBlock[]>;
  findByUserId(
  userId: string,
  includeDeleted?: boolean,
): Promise<Student | null>;
}
