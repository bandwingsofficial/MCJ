export class PermanentDeleteStudentResult {
  constructor(
    public readonly id: string,
    public readonly permanentlyDeleted: boolean,
  ) {}
}
