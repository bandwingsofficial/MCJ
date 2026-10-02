import type { TrainerRepository } from '../../domain/repositories/trainer.repository';
import { TrainerDomainService } from '../../domain/services/trainer-domain.service';

export class GetTrainerDependenciesResult {
  constructor(
    public readonly trainerId: string,
    public readonly trainerName: string,
    public readonly canDelete: boolean,
    public readonly canDeactivate: boolean,
    public readonly branchAssignmentCount: number,
    public readonly blockingBranchNames: string[],
  ) {}
}

export class GetTrainerDependenciesHandler {
  constructor(
    private readonly trainerRepo: TrainerRepository,
    private readonly domainService: TrainerDomainService,
  ) {}

  async execute(
    trainerId: string,
  ): Promise<GetTrainerDependenciesResult> {
    const trainer = await this.domainService.ensureExists(
      await this.trainerRepo.findById(trainerId, true),
    );

    const branchAssignmentCount =
      await this.trainerRepo.countBranchAssignments(trainer.id);

    const blockingBranchNames =
      branchAssignmentCount > 0
        ? await this.trainerRepo.findBranchAssignmentNames(
            trainer.id,
          )
        : [];

    const blocked = branchAssignmentCount > 0;
    const displayName = [
      trainer.firstName.getValue(),
      trainer.lastName?.getValue(),
    ]
      .filter(Boolean)
      .join(' ')
      .trim();

    return new GetTrainerDependenciesResult(
      trainer.id,
      displayName || trainer.firstName.getValue(),
      !blocked,
      !blocked,
      branchAssignmentCount,
      blockingBranchNames,
    );
  }
}
