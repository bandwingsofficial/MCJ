/**
 * Matches backend `@common/value-objects/slug.vo` Slug.normalize().
 */
export function slugifyFromTitle(title: string): string {
  return title
    ?.trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
