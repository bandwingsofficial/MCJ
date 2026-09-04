-- Add batch duration fields and extend DurationType with HOURS.

ALTER TYPE "DurationType" ADD VALUE 'HOURS';

ALTER TABLE "Batch" ADD COLUMN "durationValue" INTEGER;
ALTER TABLE "Batch" ADD COLUMN "durationType" "DurationType";
