import { Price } from '@modules/course/domain/value-objects/price.vo';

export interface BatchPricingSnapshot {
  originalPrice: number;
  discountAmount: number;
  discountPercent: number;
  discountedPrice: number;
  currency: string;
  isFree: boolean;
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function roundPercent(value: number): number {
  return Math.round(value * 100) / 100;
}

export function buildBatchPricing(params: {
  originalPrice: number;
  discountAmount: number;
  discountedPrice: number;
  currency?: string;
  isFree?: boolean;
}): BatchPricingSnapshot {
  const currency = params.currency?.trim() || 'INR';

  if (params.isFree) {
    return {
      originalPrice: 0,
      discountAmount: 0,
      discountPercent: 0,
      discountedPrice: 0,
      currency,
      isFree: true,
    };
  }

  const originalPrice = roundMoney(Math.max(0, params.originalPrice));
  let discountAmount = roundMoney(Math.max(0, params.discountAmount));
  let discountedPrice = roundMoney(Math.max(0, params.discountedPrice));

  if (originalPrice <= 0) {
    return {
      originalPrice: 0,
      discountAmount: 0,
      discountPercent: 0,
      discountedPrice: 0,
      currency,
      isFree: false,
    };
  }

  if (discountedPrice > originalPrice) {
    discountedPrice = originalPrice;
  }

  if (discountAmount > originalPrice) {
    discountAmount = originalPrice;
  }

  if (discountAmount <= 0 && discountedPrice > 0 && discountedPrice < originalPrice) {
    discountAmount = roundMoney(originalPrice - discountedPrice);
  } else if (discountedPrice <= 0 && discountAmount > 0) {
    discountedPrice = roundMoney(Math.max(0, originalPrice - discountAmount));
  } else if (discountAmount <= 0 && discountedPrice <= 0) {
    discountedPrice = originalPrice;
    discountAmount = 0;
  } else {
    const amountFromPrices = roundMoney(originalPrice - discountedPrice);
    if (Math.abs(amountFromPrices - discountAmount) > 0.01) {
      discountedPrice = roundMoney(Math.max(0, originalPrice - discountAmount));
    }
  }

  if (discountedPrice >= originalPrice) {
    discountAmount = 0;
    discountedPrice = originalPrice;
  }

  const discountPercent =
    originalPrice > 0 && discountAmount > 0
      ? roundPercent((discountAmount / originalPrice) * 100)
      : 0;

  return {
    originalPrice,
    discountAmount,
    discountPercent,
    discountedPrice,
    currency,
    isFree: false,
  };
}

export function normalizeBatchPricingInput(params: {
  originalPrice?: number | null;
  discountAmount?: number | null;
  discountedPrice?: number | null;
  currency?: string | null;
  isFree?: boolean | null;
}): {
  originalPrice: number;
  discountAmount: number;
  discountedPrice: number;
  currency: string;
  isFree: boolean;
} {
  const isFree = Boolean(params.isFree);
  const currency = params.currency?.trim() || 'INR';
  const originalPrice = Price.create(params.originalPrice ?? 0).getValue();

  if (isFree) {
    return {
      originalPrice: 0,
      discountAmount: 0,
      discountedPrice: 0,
      currency,
      isFree: true,
    };
  }

  const discountAmount = Price.create(params.discountAmount ?? 0).getValue();
  const discountedPrice =
    params.discountedPrice != null
      ? Price.create(params.discountedPrice).getValue()
      : Math.max(0, originalPrice - discountAmount);

  const pricing = buildBatchPricing({
    originalPrice,
    discountAmount,
    discountedPrice,
    currency,
    isFree: false,
  });

  return {
    originalPrice: pricing.originalPrice,
    discountAmount: pricing.discountAmount,
    discountedPrice: pricing.discountedPrice,
    currency: pricing.currency,
    isFree: false,
  };
}

export function migrateLegacyDiscountFields(params: {
  originalPrice: number;
  discountPrice: number;
  isFree: boolean;
}): {
  discountAmount: number;
  discountedPrice: number;
} {
  if (params.isFree || params.originalPrice <= 0) {
    return { discountAmount: 0, discountedPrice: 0 };
  }

  const originalPrice = roundMoney(params.originalPrice);
  const storedValue = roundMoney(Math.max(0, params.discountPrice));

  if (storedValue <= 0) {
    return { discountAmount: 0, discountedPrice: originalPrice };
  }

  if (storedValue >= originalPrice) {
    return { discountAmount: 0, discountedPrice: originalPrice };
  }

  const asAmountPercent = (storedValue / originalPrice) * 100;
  const asFinalPercent = ((originalPrice - storedValue) / originalPrice) * 100;

  const storedAsFinalPrice =
    asFinalPercent > asAmountPercent && storedValue / originalPrice < 0.15;

  if (storedAsFinalPrice) {
    return {
      discountAmount: roundMoney(originalPrice - storedValue),
      discountedPrice: storedValue,
    };
  }

  return {
    discountAmount: storedValue,
    discountedPrice: roundMoney(originalPrice - storedValue),
  };
}
