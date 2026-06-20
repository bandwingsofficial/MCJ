// src/features/enrollments/services/format-enrollment.ts

import { Enrollment } from "../types";

export const formatEnrollmentFee = (
  enrollment: Enrollment,
) =>
  new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    },
  ).format(
    enrollment.finalAmount,
  );

export const formatEnrollmentDate = (
  date: string | null,
) => {
  if (!date) {
    return "-";
  }

  return new Date(
    date,
  ).toLocaleDateString(
    "en-IN",
  );
};