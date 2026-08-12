import { TrainerGender } from '../../domain/enums/trainer-gender.enum';
import { TrainerType } from '../../domain/enums/trainer-type.enum';

export class UpdateTrainerCommand {
  constructor(
    public readonly id: string,
    public readonly firstName?: string,
    public readonly lastName?: string | null,
    public readonly email?: string | null,
    public readonly phone?: string | null,
    public readonly gender?: TrainerGender | null,
    public readonly bio?: string | null,
    public readonly qualification?: string | null,
    public readonly experienceYears?: number | null,
    public readonly specialization?: string | null,
    public readonly skills?: string[],
    public readonly profileImageFileId?: string | null,
    public readonly employeeCode?: string | null,
    public readonly trainerType?: TrainerType,
    public readonly linkedInUrl?: string | null,
    public readonly youtubeUrl?: string | null,
    public readonly instagramUrl?: string | null,
    public readonly branchId?: string | null,
    public readonly averageRating?: number,
    public readonly totalReviews?: number,
    public readonly isFeatured?: boolean,
    public readonly joinedAt?: Date | null,
    public readonly updatedBy?: string,
  ) {}
}
