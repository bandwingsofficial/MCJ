export class CreatePaymentOrderCommand {
  constructor(
    public readonly userId: string,
    public readonly enrollmentId: string,
  ) {}
}
