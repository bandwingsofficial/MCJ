export class AssignBatchTrainersCommand {
  constructor(
    public readonly id: string,
    public readonly trainerIds: string[],
    public readonly updatedBy?: string,
  ) {}
}
