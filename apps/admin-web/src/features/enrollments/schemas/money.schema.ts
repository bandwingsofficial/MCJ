import { z } from "zod";

import { normalizeMoney } from "@/src/features/enrollments/utils/format-payment";

function preprocessRequiredMoney(value: unknown): unknown {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  const amount = Number(value);

  return Number.isFinite(amount) ? amount : Number.NaN;
}

function preprocessOptionalMoney(value: unknown): number {
  return normalizeMoney(value);
}

export const requiredMoneyField = (message: string) =>
  z.preprocess(
    preprocessRequiredMoney,
    z
      .number({ message })
      .min(0, "Amount cannot be negative"),
  );

export const optionalMoneyField = z.preprocess(
  preprocessOptionalMoney,
  z.number().min(0, "Amount cannot be negative"),
);
