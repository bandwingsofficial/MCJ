export class ReorderTrainersCommand {
  constructor(
    public readonly trainerId: string,
    public readonly newDisplayOrder: number,
  ) {}
}
