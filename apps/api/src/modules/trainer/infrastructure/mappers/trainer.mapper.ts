import {
  Trainer as PrismaTrainer,
  TrainerCourse as PrismaTrainerCourse,
  Prisma,
} from '@prisma/client';

import { TrainerCourse } from '../../domain/entities/trainer-course.entity';
import { Trainer } from '../../domain/entities/trainer.entity';
import { TrainerGender } from '../../domain/enums/trainer-gender.enum';
import { TrainerStatus } from '../../domain/enums/trainer-status.enum';
import { TrainerType } from '../../domain/enums/trainer-type.enum';

export type TrainerWithRelations = PrismaTrainer & {
  branch: {
    id: string;
    branchName: string;
    branchCode: string;
  } | null;

  courses: (PrismaTrainerCourse & {
    course: {
      id: string;
      title: string;
      slug: string;
    };
  })[];
};

export class TrainerMapper {
  static toDomain(record: TrainerWithRelations): Trainer {
    return Trainer.reconstitute({
      id: record.id,
      firstName: record.firstName,
      lastName: record.lastName,
      email: record.email,
      phone: record.phone,
      gender: record.gender as TrainerGender | null,
      bio: record.bio,
      qualification: record.qualification,
      experienceYears: record.experienceYears,
      specialization: record.specialization,
      skills: record.skills,
      profileImageFileId: record.profileImageFileId,
      profileImageUrl: record.profileImageUrl,
      employeeCode: record.employeeCode,
      trainerType: record.trainerType as TrainerType,
      linkedInUrl: record.linkedInUrl,
      youtubeUrl: record.youtubeUrl,
      instagramUrl: record.instagramUrl,
      branch: record.branch
  ? {
      id: record.branch.id,
      branchName: record.branch.branchName,
      branchCode: record.branch.branchCode,
    }
  : null,
      branchId: record.branchId,
      averageRating: record.averageRating,
      totalReviews: record.totalReviews,
      isFeatured: record.isFeatured,
      status: record.status as TrainerStatus,
      joinedAt: record.joinedAt,
      courses: record.courses.map(
  (course) =>
    new TrainerCourse(
      course.id,
      course.trainerId,
      course.courseId,
      course.createdAt,
      course.updatedAt,
      course.course
        ? ({
            id: course.course.id,
            title: {
              getValue: () => course.course.title,
            },
            slug: {
              getValue: () => course.course.slug,
            },
          } as any)
        : undefined,
    ),
),
      createdBy: record.createdBy,
      updatedBy: record.updatedBy,
      isDeleted: record.isDeleted,
      deletedAt: record.deletedAt,
      deletedBy: record.deletedBy,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  static toPersistence(
    trainer: Trainer,
  ): Prisma.TrainerUncheckedCreateInput {
    return {
      id: trainer.id,
      firstName: trainer.firstName.getValue(),
      lastName: trainer.lastName?.getValue() ?? null,
      email: trainer.email.getValue(),
      phone: trainer.phone.getValue(),
      gender: trainer.gender,
      bio: trainer.bio.getValue(),
      qualification: trainer.qualification,
      experienceYears: trainer.experienceYears,
      specialization: trainer.specialization,
      skills: trainer.skills,
      profileImageFileId: trainer.profileImageFileId,
      profileImageUrl: trainer.profileImageUrl,
      employeeCode: trainer.employeeCode.getValue(),
      trainerType: trainer.trainerType,
      linkedInUrl: trainer.linkedInUrl,
      youtubeUrl: trainer.youtubeUrl,
      instagramUrl: trainer.instagramUrl,
      branchId: trainer.branchId,
      averageRating: trainer.averageRating,
      totalReviews: trainer.totalReviews,
      isFeatured: trainer.isFeatured,
      status: trainer.status,
      joinedAt: trainer.joinedAt,
      createdBy: trainer.createdBy,
      updatedBy: trainer.updatedBy,
      isDeleted: trainer.isDeleted,
      deletedAt: trainer.deletedAt,
      deletedBy: trainer.deletedBy,
      createdAt: trainer.createdAt,
      updatedAt: trainer.updatedAt,
    };
  }
}
