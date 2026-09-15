import type { CommunityPostRepository } from '../../domain/repositories/community-post.repository';
import { GetCommunityPostResult } from '../get-community-post/get-community-post.result';
import { ListCommunityPostsQuery } from './list-community-posts.query';
import { ListCommunityPostsResult } from './list-community-posts.result';

export class ListCommunityPostsHandler {
  constructor(private readonly postRepo: CommunityPostRepository) {}

  async execute(
    query: ListCommunityPostsQuery,
  ): Promise<ListCommunityPostsResult> {
    const filters = {
      status: query.status,
      type: query.type,
      search: query.search,
      includeDeleted: query.includeDeleted,
      isDeleted: query.isDeleted,
      isActive: query.isActive,
      onlyPublished: query.onlyPublished,
      skip: query.skip,
      take: query.take,
    };

    if (query.onlyPublished) {
      const [posts, total] = await Promise.all([
        this.postRepo.findPublished(filters),
        this.postRepo.count({
          ...filters,
          skip: undefined,
          take: undefined,
        }),
      ]);

      return new ListCommunityPostsResult(
        posts.map((post) => GetCommunityPostResult.fromEntity(post)),
        total,
      );
    }

    const [posts, total] = await Promise.all([
      this.postRepo.findMany(filters),
      this.postRepo.count({
        ...filters,
        skip: undefined,
        take: undefined,
      }),
    ]);

    return new ListCommunityPostsResult(
      posts.map((post) => GetCommunityPostResult.fromEntity(post)),
      total,
    );
  }
}
