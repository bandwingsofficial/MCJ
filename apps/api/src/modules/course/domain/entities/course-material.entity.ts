import { MaterialType } from '../enums/material-type.enum';

export class CourseMaterial {
  constructor(
    public readonly id: string,
    public readonly courseId: string,
    public title: string,
    public type: MaterialType,
    public fileId: string | null,
    public externalUrl: string | null,
    public displayOrder: number | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(params: {
    id: string;
    courseId: string;
    title: string;
    type: MaterialType;
    fileId?: string | null;
    externalUrl?: string | null;
    displayOrder?: number | null;
  }): CourseMaterial {
    return new CourseMaterial(
      params.id,
      params.courseId,
      params.title.trim(),
      params.type,
      params.fileId ?? null,
      params.externalUrl ?? null,
      params.displayOrder ?? null,
      new Date(),
      new Date(),
    );
  }
}
