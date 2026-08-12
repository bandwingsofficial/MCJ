export class PermanentDeleteJobResult {
  constructor(
    public readonly id: string,
    public readonly deleted: boolean,
  ) {}
}
