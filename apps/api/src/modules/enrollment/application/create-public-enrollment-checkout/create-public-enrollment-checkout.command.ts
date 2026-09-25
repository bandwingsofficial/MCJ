export class CreatePublicEnrollmentCheckoutCommand {
  constructor(
    public readonly userId: string,
    public readonly batchId: string,
    public readonly batchTimingId: string,
    public readonly branchId: string,
    public readonly courseId: string,
    public readonly coinsToRedeem: number,
  ) {}
}
