export class GetMyJobApplicationQuery {
  constructor(
    public readonly userId: string,
    public readonly id: string,
  ) {}
}
