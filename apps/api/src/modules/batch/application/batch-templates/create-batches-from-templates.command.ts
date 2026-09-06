export class CreateBatchesFromTemplatesCommand {
  constructor(
    public readonly courseId: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly templateIds: string[],
    public readonly capacity?: number,
    public readonly durationValue?: number,
    public readonly durationType?: string,
    public readonly createdBy?: string,
    public readonly originalPrice?: number,
    public readonly discountAmount?: number,
    public readonly discountedPrice?: number,
    public readonly currency?: string,
    public readonly isFree?: boolean,
    public readonly name?: string,
  ) {}
}
