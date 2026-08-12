export class UpdateJobActivationCommand {
  constructor(
    public readonly id: string,
    public readonly activate: boolean,
    public readonly updatedBy?: string,
  ) {}
}
