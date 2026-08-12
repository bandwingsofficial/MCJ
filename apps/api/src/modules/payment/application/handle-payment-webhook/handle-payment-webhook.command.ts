export class HandlePaymentWebhookCommand {
  constructor(
    public readonly rawBody: string,
    public readonly signature: string,
  ) {}
}
