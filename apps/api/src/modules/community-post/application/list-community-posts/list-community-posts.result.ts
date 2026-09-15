import { GetCommunityPostResult } from '../get-community-post/get-community-post.result';

export class ListCommunityPostsResult {
  constructor(
    public readonly items: GetCommunityPostResult[],
    public readonly total: number,
  ) {}
}
