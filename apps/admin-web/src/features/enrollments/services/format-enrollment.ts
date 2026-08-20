// src/features/enrollments/services/format-enrollment.ts

import { Enrollment } from "../types";
import { formatCurrency } from "../utils/format-payment";

export const formatEnrollmentFee = (enrollment: Enrollment) =>
  formatCurrency(enrollment.finalAmount);

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