import type { TrainerRepository } from '../../domain/repositories/trainer.repository';

import {
  buildTrainerEmployeeCode,
  TRAINER_EMPLOYEE_CODE_PREFIX,
} from './build-trainer-employee-code';
import { SuggestTrainerCodeQuery } from './suggest-trainer-code.query';
import { SuggestTrainerCodeResult } from './suggest-trainer-code.result';

export class SuggestTrainerCodeHandler {
  constructor(
    private readonly trainerRepo: TrainerRepository,
  ) {}

  async execute(
    _query: SuggestTrainerCodeQuery,
  ): Promise<SuggestTrainerCodeResult> {
    const maxSuffix =
      await this.trainerRepo.getMaxNumericSuffixForPrefix(
        TRAINER_EMPLOYEE_CODE_PREFIX,
      );
    const employeeCode = buildTrainerEmployeeCode(maxSuffix);

    return new SuggestTrainerCodeResult(
      employeeCode,
      TRAINER_EMPLOYEE_CODE_PREFIX,
    );
  }
}
