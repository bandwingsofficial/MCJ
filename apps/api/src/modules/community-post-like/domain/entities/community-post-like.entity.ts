export class CommunityPostLike {
  private constructor(
    public readonly id: string,
    public readonly postId: string,
    public readonly userId: string,
    public isDeleted: boolean,
    public deletedAt: Date | null,
    public readonly createdAt: Date,
  ) {}

  static create(params: {
    id: string;
    postId: string;
    userId: string;
  }): CommunityPostLike {
    return new CommunityPostLike(
      params.id,
      params.postId,
      params.userId,
      false,
      null,
      new Date(),
    );
  }

  static reconstitute(params: {
    id: string;
    postId: string;
    userId: string;
    isDeleted: boolean;
    deletedAt: Date | null;
    createdAt: Date;
  }): CommunityPostLike {
    return new CommunityPostLike(
      params.id,
      params.postId,
      params.userId,
      params.isDeleted,
      params.deletedAt,
      params.createdAt,
    );
  }
}
