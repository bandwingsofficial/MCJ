export class BulkPermanentDeleteCoursesCommand {
  constructor(public readonly courseIds: string[]) {}
}
