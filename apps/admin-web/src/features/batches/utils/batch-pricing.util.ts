import { normalizeMoney } from "@/src/features/enrollments/utils/format-payment";

export interface BatchPricing {
  originalPrice: number;
  discountAmount: number;
  discountPercent: number;
  discountedPrice: number;
  currency: string;
  isFree: boolean;
}

export interface BatchPricingSource {
  pricing?: Partial<BatchPricing> | null;
  originalPrice?: number | string | null;
  discountAmount?: number | string | null;
  discountPercent?: number | string | null;
  discountedPrice?: number | string | null;
  currency?: string | null;
  isFree?: boolean | null;
}

export function getBatchPricing(source: BatchPricingSource): BatchPricing {
  if (source.pricing) {
    return normalizeBatchPricing(source.pricing);
  }

  return normalizeBatchPricing({
    originalPrice: source.originalPrice != null ? Number(source.originalPrice) : undefined,
    discountAmount:
      source.discountAmount != null ? Number(source.discountAmount) : undefined,
    discountPercent:
      source.discountPercent != null ? Number(source.discountPercent) : undefined,
    discountedPrice:
      source.discountedPrice != null ? Number(source.discountedPrice) : undefined,
    currency: source.currency ?? undefined,
    isFree: source.isFree ?? undefined,
  });
}

export function normalizeBatchPricing(
  pricing?: Partial<BatchPricing> | null,
): BatchPricing {
  if (!pricing) {
    return {
      originalPrice: 0,
      discountAmount: 0,
      discountPercent: 0,
      discountedPrice: 0,
      currency: "INR",
      isFree: false,
    };
  }

  const originalPrice = normalizeMoney(pricing.originalPrice);
  const discountAmount = normalizeMoney(pricing.discountAmount);
  const discountedPrice = normalizeMoney(
    pricing.discountedPrice ?? Math.max(0, originalPrice - discountAmount),
  );
  const currency = pricing.currency?.trim() || "INR";
  const isFree = Boolean(pricing.isFree);

  if (isFree) {
    return {
      originalPrice: 0,
      discountAmount: 0,
      discountPercent: 0,
      discountedPrice: 0,
      currency,
      isFree: true,
    };
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

export function buildBatchPricingInput(params: {
  originalPrice: number;
  discountAmount?: number;
  discountPercent?: number;
  discountedPrice?: number;
  currency?: string;
  isFree?: boolean;
}): Pick<
  BatchPricing,
  | "originalPrice"
  | "discountAmount"
  | "discountedPrice"
  | "currency"
  | "isFree"
> {
  if (params.isFree) {
    return {
      originalPrice: 0,
      discountAmount: 0,
      discountedPrice: 0,
      currency: params.currency?.trim() || "INR",
      isFree: true,
    };
  }

  const originalPrice = normalizeMoney(params.originalPrice);
  let discountAmount = normalizeMoney(params.discountAmount);
  let discountedPrice = normalizeMoney(params.discountedPrice);

  if (
    discountAmount <= 0 &&
    params.discountPercent != null &&
    params.discountPercent > 0 &&
    originalPrice > 0
  ) {
    discountAmount = normalizeMoney(
      (originalPrice * params.discountPercent) / 100,
    );
  }

  if (discountedPrice <= 0 && originalPrice > 0) {
    discountedPrice = Math.max(0, originalPrice - discountAmount);
  }

  if (
    discountedPrice > 0 &&
    discountAmount <= 0 &&
    originalPrice > discountedPrice
  ) {
    discountAmount = normalizeMoney(originalPrice - discountedPrice);
  }

  const normalized = normalizeBatchPricing({
    originalPrice,
    discountAmount,
    discountedPrice,
    currency: params.currency,
    isFree: false,
  });

  return {
    originalPrice: normalized.originalPrice,
    discountAmount: normalized.discountAmount,
    discountedPrice: normalized.discountedPrice,
    currency: normalized.currency,
    isFree: false,
  };
}

export function formatBatchPrice(source: BatchPricingSource): string {
  const pricing = getBatchPricing(source);

  if (pricing.isFree) {
    return "Free";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: pricing.currency,
    maximumFractionDigits: 2,
  }).format(pricing.discountedPrice);
}

export function formatBatchOriginalPrice(source: BatchPricingSource): string {
  const pricing = getBatchPricing(source);

  if (pricing.isFree) {
    return "Free";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: pricing.currency,
    maximumFractionDigits: 2,
  }).format(pricing.originalPrice);
}

export function getBatchDefaultDiscount(source: BatchPricingSource): number {
  return getBatchPricing(source).discountAmount;
}
