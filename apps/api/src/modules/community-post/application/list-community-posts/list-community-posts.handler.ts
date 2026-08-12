import type { CommunityPostRepository } from '../../domain/repositories/community-post.repository';
import { GetCommunityPostResult } from '../get-community-post/get-community-post.result';
import { ListCommunityPostsQuery } from './list-community-posts.query';

export class ListCommunityPostsHandler {
  constructor(private readonly postRepo: CommunityPostRepository) {}

  async execute(
    query: ListCommunityPostsQuery,
  ): Promise<GetCommunityPostResult[]> {
    const posts = query.onlyPublished
      ? await this.postRepo.findPublished({
          search: query.search,
          skip: query.skip,
          take: query.take,
        })
      : await this.postRepo.findMany({
          status: query.status,
          search: query.search,
          includeDeleted: query.includeDeleted,
          skip: query.skip,
          take: query.take,
        });

    return posts.map((post) => GetCommunityPostResult.fromEntity(post));
  }
}
