export class CreatePaymentOrderResult {
  constructor(
    public readonly orderId: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly keyId: string,
    public readonly paymentId: string,
    public readonly paymentNumber: string,
  ) {}
}
