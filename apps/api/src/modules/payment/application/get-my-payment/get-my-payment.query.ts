export class GetMyPaymentQuery {
  constructor(
    public readonly userId: string,
    public readonly id: string,
  ) {}
}
