export function formatFinanceNewsDate(
  value: string | null | undefined,
): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(date);
}

export function getFinanceNewsDetailPath(slug: string): string {
  return `/finance-news/${encodeURIComponent(slug)}`;
}
