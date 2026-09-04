export interface BatchPricing {
  originalPrice: number;
  discountAmount: number;
  discountPercent: number;
  discountedPrice: number;
  currency: string;
  isFree: boolean;
}

export const EMPTY_BATCH_PRICING: BatchPricing = {
  originalPrice: 0,
  discountAmount: 0,
  discountPercent: 0,
  discountedPrice: 0,
  currency: "INR",
  isFree: false,
};

export function normalizeBatchPricing(
  pricing?: Partial<BatchPricing> | null,
): BatchPricing {
  if (!pricing) {
    return { ...EMPTY_BATCH_PRICING };
  }

  const originalPrice = Number.isFinite(Number(pricing.originalPrice))
    ? Number(pricing.originalPrice)
    : 0;
  const discountAmount = Number.isFinite(Number(pricing.discountAmount))
    ? Number(pricing.discountAmount)
    : 0;
  const discountedPrice = Number.isFinite(Number(pricing.discountedPrice))
    ? Number(pricing.discountedPrice)
    : Math.max(0, originalPrice - discountAmount);
  const currency = pricing.currency?.trim() || "INR";
  const isFree = Boolean(pricing.isFree);

  if (isFree) {
    return { ...EMPTY_BATCH_PRICING, currency, isFree: true };
  }

  const safeOriginal = Math.max(0, originalPrice);
  const safeDiscount = Math.max(0, Math.min(discountAmount, safeOriginal));
  const safeDiscounted = Math.max(
    0,
    Math.min(
      discountedPrice > 0 ? discountedPrice : safeOriginal - safeDiscount,
      safeOriginal,
    ),
  );
  const resolvedDiscount =
    safeDiscount > 0
      ? safeDiscount
      : safeDiscounted < safeOriginal
        ? safeOriginal - safeDiscounted
        : 0;
  const discountPercent =
    safeOriginal > 0 && resolvedDiscount > 0
      ? Math.round((resolvedDiscount / safeOriginal) * 10000) / 100
      : Number.isFinite(Number(pricing.discountPercent))
        ? Number(pricing.discountPercent)
        : 0;

  return {
    originalPrice: safeOriginal,
    discountAmount: resolvedDiscount,
    discountPercent,
    discountedPrice: resolvedDiscount > 0 ? safeDiscounted : safeOriginal,
    currency,
    isFree: false,
  };
}

/** Accepts a Batch with nested `pricing` or flat pricing fields. */
export function getBatchPricing(batch: {
  pricing?: Partial<BatchPricing> | null;
  originalPrice?: number;
  discountAmount?: number;
  discountPercent?: number;
  discountedPrice?: number;
  currency?: string;
  isFree?: boolean;
} | null | undefined): BatchPricing {
  if (!batch) {
    return { ...EMPTY_BATCH_PRICING };
  }

  if (batch.pricing) {
    return normalizeBatchPricing(batch.pricing);
  }

  return normalizeBatchPricing({
    originalPrice: batch.originalPrice,
    discountAmount: batch.discountAmount,
    discountPercent: batch.discountPercent,
    discountedPrice: batch.discountedPrice,
    currency: batch.currency,
    isFree: batch.isFree,
  });
}

export function formatCurrency(amount: number, currency = "INR"): string {
  const value = Number.isFinite(amount) ? amount : 0;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatBatchPrice(batch: {
  pricing?: Partial<BatchPricing> | null;
  originalPrice?: number;
  discountAmount?: number;
  discountPercent?: number;
  discountedPrice?: number;
  currency?: string;
  isFree?: boolean;
} | null | undefined): string {
  const pricing = getBatchPricing(batch);

  if (pricing.isFree) {
    return "Free";
  }

  return formatCurrency(pricing.discountedPrice, pricing.currency);
}

export function getBatchDiscountPercent(batch: {
  pricing?: Partial<BatchPricing> | null;
  originalPrice?: number;
  discountAmount?: number;
  discountPercent?: number;
  discountedPrice?: number;
  currency?: string;
  isFree?: boolean;
} | null | undefined): number | null {
  const pricing = getBatchPricing(batch);

  if (
    pricing.isFree ||
    pricing.originalPrice <= 0 ||
    pricing.discountAmount <= 0 ||
    pricing.discountedPrice >= pricing.originalPrice
  ) {
    return null;
  }

  const rounded = Math.round(pricing.discountPercent);

  return rounded > 0 ? rounded : null;
}

export function hasBatchDiscount(batch: {
  pricing?: Partial<BatchPricing> | null;
  originalPrice?: number;
  discountAmount?: number;
  discountPercent?: number;
  discountedPrice?: number;
  currency?: string;
  isFree?: boolean;
} | null | undefined): boolean {
  return getBatchDiscountPercent(batch) !== null;
}
