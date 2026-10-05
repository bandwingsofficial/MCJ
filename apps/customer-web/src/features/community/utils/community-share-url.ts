export function buildCommunityPostSharePath(postId: string): string {
  return `/community/posts/${postId}`;
}

export function buildCommunityPostShareUrl(
  postId: string,
  origin?: string,
): string {
  const base =
    origin ??
    (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}${buildCommunityPostSharePath(postId)}`;
}
