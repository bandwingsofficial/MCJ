export class BatchTrainer {
  constructor(
    public readonly id: string,
    public readonly batchId: string,
    public readonly trainerId: string,
    public readonly createdAt: Date,
    public updatedAt: Date,

    public trainer?: {
      id: string;
      firstName: {
        getValue(): string;
      };
      lastName: {
        getValue(): string | null;
      };
      employeeCode: {
        getValue(): string;
      };
    },
  ) {}

  static create(params: {
    id: string;
    batchId: string;
    trainerId: string;
  }): BatchTrainer {
    return new BatchTrainer(
      params.id,
      params.batchId,
      params.trainerId,
      new Date(),
      new Date(),
    );
  }
}
