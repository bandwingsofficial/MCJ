export const MCJ_ACADEMY_BRAND = "MCJ Academy";

export const MCJ_ROOT_METADATA_TITLE = {
  default: MCJ_ACADEMY_BRAND,
  template: `${MCJ_ACADEMY_BRAND} | %s`,
} as const;

export type PageTitleRule = {
  pattern: RegExp;
  title: string | ((match: RegExpMatchArray) => string);
};

export function isValidPageTitleSegment(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return false;
  }

  const lowered = trimmed.toLowerCase();

  return (
    lowered !== "undefined" &&
    lowered !== "null" &&
    !trimmed.includes("[object Object]")
  );
}

export function formatMcjEntityPageTitle(
  entityLabel: string,
  entityName: unknown,
): string | null {
  if (!isValidPageTitleSegment(entityName)) {
    return null;
  }

  return `${entityLabel} - ${entityName.trim()}`;
}

export function formatMcjPageTitle(pageName: string | null | undefined): string {
  if (!isValidPageTitleSegment(pageName)) {
    return MCJ_ACADEMY_BRAND;
  }

  if (pageName.trim() === MCJ_ACADEMY_BRAND) {
    return MCJ_ACADEMY_BRAND;
  }

  return `${MCJ_ACADEMY_BRAND} | ${pageName.trim()}`;
}

export function resolvePageTitleFromPathname(
  pathname: string,
  rules: readonly PageTitleRule[],
  fallback: string | null = null,
): string | null {
  const normalized =
    pathname.split("?")[0]?.replace(/\/+$/, "") || "/";

  for (const rule of rules) {
    const match = normalized.match(rule.pattern);

    if (!match) {
      continue;
    }

    const title =
      typeof rule.title === "function" ? rule.title(match) : rule.title;

    if (isValidPageTitleSegment(title)) {
      return title.trim();
    }
  }

  return fallback;
}
