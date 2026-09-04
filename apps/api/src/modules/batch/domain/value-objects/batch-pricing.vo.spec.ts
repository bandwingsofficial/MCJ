import {
  buildBatchPricing,
  migrateLegacyDiscountFields,
} from './batch-pricing.vo';

describe('buildBatchPricing', () => {
  it('calculates 92% off for 13000 -> 1000', () => {
    const pricing = buildBatchPricing({
      originalPrice: 13000,
      discountAmount: 12000,
      discountedPrice: 1000,
      currency: 'INR',
      isFree: false,
    });

    expect(pricing.discountAmount).toBe(12000);
    expect(pricing.discountedPrice).toBe(1000);
    expect(pricing.discountPercent).toBe(92.31);
  });

  it('calculates 20% off for 10000 -> 8000', () => {
    const pricing = buildBatchPricing({
      originalPrice: 10000,
      discountAmount: 2000,
      discountedPrice: 8000,
      currency: 'INR',
      isFree: false,
    });

    expect(pricing.discountAmount).toBe(2000);
    expect(pricing.discountedPrice).toBe(8000);
    expect(pricing.discountPercent).toBe(20);
  });

  it('calculates 50% off for 5000 -> 2500', () => {
    const pricing = buildBatchPricing({
      originalPrice: 5000,
      discountAmount: 2500,
      discountedPrice: 2500,
      currency: 'INR',
      isFree: false,
    });

    expect(pricing.discountAmount).toBe(2500);
    expect(pricing.discountedPrice).toBe(2500);
    expect(pricing.discountPercent).toBe(50);
  });

  it('returns zero discount when prices are equal', () => {
    const pricing = buildBatchPricing({
      originalPrice: 1000,
      discountAmount: 0,
      discountedPrice: 1000,
      currency: 'INR',
      isFree: false,
    });

    expect(pricing.discountAmount).toBe(0);
    expect(pricing.discountPercent).toBe(0);
    expect(pricing.discountedPrice).toBe(1000);
  });

  it('returns free pricing snapshot', () => {
    const pricing = buildBatchPricing({
      originalPrice: 13000,
      discountAmount: 12000,
      discountedPrice: 1000,
      currency: 'INR',
      isFree: true,
    });

    expect(pricing.isFree).toBe(true);
    expect(pricing.discountedPrice).toBe(0);
    expect(pricing.discountAmount).toBe(0);
  });
});

describe('migrateLegacyDiscountFields', () => {
  it('migrates final price stored in legacy discountPrice field', () => {
    const migrated = migrateLegacyDiscountFields({
      originalPrice: 13000,
      discountPrice: 1000,
      isFree: false,
    });

    expect(migrated.discountAmount).toBe(12000);
    expect(migrated.discountedPrice).toBe(1000);
  });

  it('keeps discount amount semantics for moderate discounts', () => {
    const migrated = migrateLegacyDiscountFields({
      originalPrice: 10000,
      discountPrice: 2000,
      isFree: false,
    });

    expect(migrated.discountAmount).toBe(2000);
    expect(migrated.discountedPrice).toBe(8000);
  });
});
