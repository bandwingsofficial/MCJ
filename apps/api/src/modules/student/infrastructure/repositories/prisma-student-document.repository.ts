import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

import { StudentDocument } from '../../domain/entities/student-document.entity';
import {
  CreateStudentDocumentRecord,
  StudentDocumentRepository,
  UpdateStudentDocumentRecord,
} from '../../domain/repositories/student-document.repository';
import { StudentDocumentMapper } from '../mappers/student-document.mapper';

const FILE_INCLUDE = {
  file: true,
} as const;

export class PrismaStudentDocumentRepository
  implements StudentDocumentRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async create(
    record: CreateStudentDocumentRecord,
  ): Promise<StudentDocument> {
    const created = await this.prisma.studentDocument.create({
      data: {
        id: record.id,
        studentId: record.studentId,
        name: record.name,
        type: StudentDocumentMapper.toPrismaType(record.type),
        description: record.description ?? null,
        fileId: record.fileId,
        createdBy: record.createdBy ?? null,
      },
      include: FILE_INCLUDE,
    });

    return StudentDocumentMapper.toDomain(created);
  }

  async update(
    id: string,
    record: UpdateStudentDocumentRecord,
  ): Promise<StudentDocument> {
    const updated = await this.prisma.studentDocument.update({
      where: { id },
      data: {
        ...(record.name !== undefined ? { name: record.name } : {}),
        ...(record.type !== undefined
          ? { type: StudentDocumentMapper.toPrismaType(record.type) }
          : {}),
        ...(record.description !== undefined
          ? { description: record.description }
          : {}),
        ...(record.fileId !== undefined ? { fileId: record.fileId } : {}),
        ...(record.updatedBy !== undefined
          ? { updatedBy: record.updatedBy }
          : {}),
      },
      include: FILE_INCLUDE,
    });

    return StudentDocumentMapper.toDomain(updated);
  }

  async findById(id: string): Promise<StudentDocument | null> {
    const record = await this.prisma.studentDocument.findUnique({
      where: { id },
      include: FILE_INCLUDE,
    });

    return record ? StudentDocumentMapper.toDomain(record) : null;
  }

  async findByStudentId(studentId: string): Promise<StudentDocument[]> {
    const records = await this.prisma.studentDocument.findMany({
      where: { studentId },
      include: FILE_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });

    return records.map((record) => StudentDocumentMapper.toDomain(record));
  }

  async deleteById(id: string): Promise<void> {
    await this.prisma.studentDocument.delete({
      where: { id },
    });
  }
}
