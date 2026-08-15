export class BulkDeleteCoursesCommand {
  constructor(public readonly courseIds: string[]) {}
}
