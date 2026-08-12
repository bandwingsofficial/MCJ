export class GetPaymentQuery {
  constructor(
    public readonly id: string,
    public readonly includeDeleted?: boolean,
  ) {}
}
