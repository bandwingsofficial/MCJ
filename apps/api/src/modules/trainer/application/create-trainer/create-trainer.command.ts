import { TrainerGender } from '../../domain/enums/trainer-gender.enum';
import { TrainerStatus } from '../../domain/enums/trainer-status.enum';
import { TrainerType } from '../../domain/enums/trainer-type.enum';

export class CreateTrainerCommand {
  constructor(
    public readonly firstName: string,
    public readonly lastName?: string,
    public readonly email?: string,
    public readonly phone?: string,
    public readonly gender?: TrainerGender,
    public readonly bio?: string,
    public readonly qualification?: string,
    public readonly experienceYears?: number,
    public readonly specialization?: string,
    public readonly skills: string[] = [],
    public readonly profileImageFileId?: string,
    public readonly employeeCode?: string,
    public readonly trainerType?: TrainerType,
    public readonly linkedInUrl?: string,
    public readonly youtubeUrl?: string,
    public readonly instagramUrl?: string,
    public readonly branchId?: string,
    public readonly averageRating?: number,
    public readonly totalReviews?: number,
    public readonly isFeatured?: boolean,
    public readonly status?: TrainerStatus,
    public readonly joinedAt?: Date,
    public readonly courseIds: string[] = [],
    public readonly createdBy?: string,
  ) {}
}
