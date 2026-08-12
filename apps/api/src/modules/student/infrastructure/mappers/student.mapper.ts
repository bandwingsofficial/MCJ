import {
  Student as PrismaStudent,
  Prisma,
} from '@prisma/client';

import { Student } from '../../domain/entities/student.entity';
import { StudentGender } from '../../domain/enums/student-gender.enum';
import { StudentStatus } from '../../domain/enums/student-status.enum';

export class StudentMapper {
  static toDomain(record: PrismaStudent): Student {
    return Student.reconstitute({
      id: record.id,
      userId: record.userId,
      firstName: record.firstName,
      lastName: record.lastName,
      email: record.email,
      phone: record.phone,
      gender: record.gender as StudentGender | null,
      dateOfBirth: record.dateOfBirth,
      addressLine1: record.addressLine1,
      addressLine2: record.addressLine2,
      city: record.city,
      state: record.state,
      country: record.country,
      postalCode: record.postalCode,
      profileImageFileId: record.profileImageFileId,
      profileImageUrl: record.profileImageUrl,
      qualification: record.qualification,
      collegeName: record.collegeName,
      specialization: record.specialization,
      passingYear: record.passingYear,
      parentName: record.parentName,
      parentPhone: record.parentPhone,
      emergencyContactName: record.emergencyContactName,
      emergencyContactPhone: record.emergencyContactPhone,
      studentCode: record.studentCode,
      admissionDate: record.admissionDate,
      branchId: record.branchId,
      notes: record.notes,
      isActive: record.isActive,
      status: record.status as StudentStatus,      createdBy: record.createdBy,
      updatedBy: record.updatedBy,
      isDeleted: record.isDeleted,
      deletedAt: record.deletedAt,
      deletedBy: record.deletedBy,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  static toPersistence(
    student: Student,
  ): Prisma.StudentUncheckedCreateInput {
    return {
      id: student.id,
      userId: student.userId,
      firstName: student.firstName.getValue(),
      lastName: student.lastName?.getValue() ?? null,
      email: student.email.getValue(),
      phone: student.phone.getValue(),
      gender: student.gender,
      dateOfBirth: student.dateOfBirth,
      addressLine1: student.address.addressLine1,
      addressLine2: student.address.addressLine2,
      city: student.address.city,
      state: student.address.state,
      country: student.address.country,
      postalCode: student.address.postalCode,
      profileImageFileId: student.profileImageFileId,
      profileImageUrl: student.profileImageUrl,
      qualification: student.qualification.getValue(),
      collegeName: student.collegeName,
      specialization: student.specialization,
      passingYear: student.passingYear,
      parentName: student.parentName?.getValue() ?? null,
      parentPhone: student.parentPhone.getValue(),
      emergencyContactName:
        student.emergencyContactName?.getValue() ?? null,
      emergencyContactPhone:
        student.emergencyContactPhone.getValue(),
      studentCode: student.studentCode.getValue(),
      admissionDate: student.admissionDate,
      branchId: student.branchId,
      notes: student.notes,
      isActive: student.isActive,
      status: student.status,      createdBy: student.createdBy,
      updatedBy: student.updatedBy,
      isDeleted: student.isDeleted,
      deletedAt: student.deletedAt,
      deletedBy: student.deletedBy,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
    };
  }
}
