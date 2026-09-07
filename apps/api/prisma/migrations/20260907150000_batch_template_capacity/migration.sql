-- Per-timing default capacity on batch timing masters (BatchTemplate).
ALTER TABLE "BatchTemplate" ADD COLUMN "capacity" INTEGER NOT NULL DEFAULT 1;
