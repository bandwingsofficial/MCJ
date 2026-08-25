-- Remove delivery mode from Course (mode belongs on Batch only)
ALTER TABLE "Course" DROP COLUMN IF EXISTS "mode";
