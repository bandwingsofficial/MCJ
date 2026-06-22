export function formatSalary(
  salary: number,
): string {
  if (!salary || salary <= 0) {
    return "Not Disclosed";
  }

  return `${new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    },
  ).format(salary)} / year`;
}