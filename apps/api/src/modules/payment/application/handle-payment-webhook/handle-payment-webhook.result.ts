export class HandlePaymentWebhookResult {
  constructor(
    public readonly received: boolean,
    public readonly event: string | null,
    public readonly handled: boolean,
  ) {}
}
