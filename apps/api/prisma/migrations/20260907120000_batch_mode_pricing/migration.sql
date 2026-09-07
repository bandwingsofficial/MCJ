-- Per-mode pricing for multi-mode parent batches
ALTER TABLE "Batch" ADD COLUMN "modePricing" JSONB;
