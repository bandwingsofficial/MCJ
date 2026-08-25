import {
  StudentDocument as PrismaStudentDocument,
  Upload as PrismaUpload,
  StudentDocumentType as PrismaStudentDocumentType,
} from '@prisma/client';

import { StudentDocument } from '../../domain/entities/student-document.entity';
import { StudentDocumentType } from '../../domain/enums/student-document-type.enum';

type PrismaStudentDocumentWithFile = PrismaStudentDocument & {
  file?: PrismaUpload | null;
};

export class StudentDocumentMapper {
  static toDomain(
    record: PrismaStudentDocumentWithFile,
  ): StudentDocument {
    return new StudentDocument(
      record.id,
      record.studentId,
      record.name,
      record.type as StudentDocumentType,
      record.description,
      record.fileId,
      record.file?.originalName ?? null,
      record.file?.size ?? null,
      record.file?.url ?? null,
      record.file?.mimeType ?? null,
      record.createdBy,
      record.updatedBy,
      record.createdAt,
      record.updatedAt,
    );
  }

  static toPrismaType(
    type: StudentDocumentType,
  ): PrismaStudentDocumentType {
    return type as PrismaStudentDocumentType;
  }
}
