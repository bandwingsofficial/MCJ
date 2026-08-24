export class SetLessonPreviewCommand {
  constructor(
    public readonly id: string,
    public readonly isPreview: boolean,
    public readonly updatedBy?: string | null,
  ) {}
}
