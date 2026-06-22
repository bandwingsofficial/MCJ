export function formatDate(
  value: string | null,
): string {
  if (!value) {
    return "Not Assigned";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(new Date(value));
}