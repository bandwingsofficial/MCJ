export class VerifyPaymentCommand {
  constructor(
    public readonly userId: string,
    public readonly enrollmentId: string | null,
    public readonly razorpayOrderId: string,
    public readonly razorpayPaymentId: string,
    public readonly razorpaySignature: string,
  ) {}
}
