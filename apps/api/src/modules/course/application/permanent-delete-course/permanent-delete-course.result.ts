export class PermanentDeleteCourseResult {
  constructor(
    public readonly id: string,
    public readonly permanentlyDeleted: boolean,
  ) {}
}
