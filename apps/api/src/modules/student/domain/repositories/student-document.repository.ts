import { StudentDocument } from '../entities/student-document.entity';
import { StudentDocumentType } from '../enums/student-document-type.enum';

export interface CreateStudentDocumentRecord {
  id: string;
  studentId: string;
  name: string;
  type: StudentDocumentType;
  description?: string | null;
  fileId: string;
  createdBy?: string | null;
}

export interface UpdateStudentDocumentRecord {
  name?: string;
  type?: StudentDocumentType;
  description?: string | null;
  fileId?: string;
  updatedBy?: string | null;
}

export interface StudentDocumentRepository {
  create(record: CreateStudentDocumentRecord): Promise<StudentDocument>;
  update(
    id: string,
    record: UpdateStudentDocumentRecord,
  ): Promise<StudentDocument>;
  findById(id: string): Promise<StudentDocument | null>;
  findByStudentId(studentId: string): Promise<StudentDocument[]>;
  deleteById(id: string): Promise<void>;
}
