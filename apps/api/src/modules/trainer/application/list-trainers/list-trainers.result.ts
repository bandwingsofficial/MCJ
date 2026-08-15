import { GetTrainerResult } from '../get-trainer/get-trainer.result';

export class ListTrainersResult {
  constructor(
    public readonly items: GetTrainerResult[],
    public readonly total: number,
  ) {}
}
