export class CommunityPostComment {
  private constructor(
    public readonly id: string,
    public postId: string,
    public userId: string,
    public parentId: string | null,
    public content: string,
    public isBlocked: boolean,
    public isDeleted: boolean,
    public deletedAt: Date | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(params: {
    id: string;
    postId: string;
    userId: string;
    parentId?: string | null;
    content: string;
  }): CommunityPostComment {
    return new CommunityPostComment(
      params.id,
      params.postId,
      params.userId,
      params.parentId ?? null,
      params.content.trim(),
      false,
      false,
      null,
      new Date(),
      new Date(),
    );
  }

  static reconstitute(params: {
    id: string;
    postId: string;
    userId: string;
    parentId: string | null;
    content: string;
    isBlocked: boolean;
    isDeleted: boolean;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): CommunityPostComment {
    return new CommunityPostComment(
      params.id,
      params.postId,
      params.userId,
      params.parentId,
      params.content,
      params.isBlocked,
      params.isDeleted,
      params.deletedAt,
      params.createdAt,
      params.updatedAt,
    );
  }

  updateContent(content: string) {
    this.content = content.trim();
    this.touch();
  }

  softDelete() {
    this.isDeleted = true;
    this.deletedAt = new Date();
    this.touch();
  }

  restore() {
    this.isDeleted = false;
    this.deletedAt = null;
    this.touch();
  }

  block() {
    this.isBlocked = true;
    this.touch();
  }

  unblock() {
    this.isBlocked = false;
    this.touch();
  }

  private touch() {
    this.updatedAt = new Date();
  }
}
