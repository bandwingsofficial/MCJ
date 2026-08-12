// course-branch.entity.ts

export class CourseBranch {
  constructor(
    public readonly courseId: string,
    public readonly branchId: string,
  ) {}

  static create(params: {
    courseId: string;
    branchId: string;
  }): CourseBranch {
    return new CourseBranch(
      params.courseId,
      params.branchId,
    );
  }
}