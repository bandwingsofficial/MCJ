export class ReorderTrainersResult {
  constructor(
    public readonly trainerId: string,
    public readonly displayOrder: number,
  ) {}
}
