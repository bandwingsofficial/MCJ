import { Trainer } from '../../domain/entities/trainer.entity';
import { TrainerGender } from '../../domain/enums/trainer-gender.enum';
import { TrainerStatus } from '../../domain/enums/trainer-status.enum';
import { TrainerType } from '../../domain/enums/trainer-type.enum';

export class TrainerCourseResult {
  constructor(
    public readonly id: string,
    public readonly title: string | null,
  ) {}
}

export class TrainerBranchResult {
  constructor(
    public readonly id: string,
    public readonly branchName: string,
    public readonly branchCode: string,
  ) {}
}

export class GetTrainerResult {
  constructor(
    public readonly id: string,
    public readonly firstName: string,
    public readonly lastName: string | null,
    public readonly email: string | null,
    public readonly phone: string | null,
    public readonly gender: TrainerGender | null,
    public readonly bio: string | null,
    public readonly qualification: string | null,
    public readonly experienceYears: number | null,
    public readonly specialization: string | null,
    public readonly skills: string[],
    public readonly profileImageFileId: string | null,
    public readonly profileImageUrl: string | null,
    public readonly employeeCode: string | null,
    public readonly trainerType: TrainerType,
    public readonly linkedInUrl: string | null,
    public readonly youtubeUrl: string | null,
    public readonly instagramUrl: string | null,
    public readonly branch: TrainerBranchResult | null,
    public readonly averageRating: number,
    public readonly totalReviews: number,
    public readonly isFeatured: boolean,
    public readonly status: TrainerStatus,
    public readonly displayOrder: number | null,
    public readonly joinedAt: Date | null,
    public readonly courses: TrainerCourseResult[],
    public readonly createdBy: string | null,
    public readonly updatedBy: string | null,
    public readonly isDeleted: boolean,
    public readonly deletedAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static fromEntity(trainer: Trainer): GetTrainerResult {
    return new GetTrainerResult(
      trainer.id,
      trainer.firstName.getValue(),
      trainer.lastName?.getValue() ?? null,
      trainer.email.getValue(),
      trainer.phone.getValue(),
      trainer.gender,
      trainer.bio.getValue(),
      trainer.qualification,
      trainer.experienceYears,
      trainer.specialization,
      trainer.skills,
      trainer.profileImageFileId,
      trainer.profileImageUrl,
      trainer.employeeCode.getValue(),
      trainer.trainerType,
      trainer.linkedInUrl,
      trainer.youtubeUrl,
      trainer.instagramUrl,
      trainer.branch
  ? new TrainerBranchResult(
      trainer.branch.id,
      trainer.branch.branchName,
      trainer.branch.branchCode,
    )
  : null,
      trainer.averageRating,
      trainer.totalReviews,
      trainer.isFeatured,
      trainer.status,
      trainer.displayOrder,
      trainer.joinedAt,
      trainer.courses.map(
  (course) =>
    new TrainerCourseResult(
      
      course.courseId,
      course.course?.title.getValue() ?? null,
    ),
),
      trainer.createdBy,
      trainer.updatedBy,
      trainer.isDeleted,
      trainer.deletedAt,
      trainer.createdAt,
      trainer.updatedAt,
    );
  }
}
