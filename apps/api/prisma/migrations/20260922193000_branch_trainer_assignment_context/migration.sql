-- Branch trainer assignments: branch-only vs course/batch/timing context.

CREATE TYPE "BranchTrainerAssignmentType" AS ENUM ('BRANCH_ONLY', 'COURSE_BATCH');

ALTER TABLE "BranchTrainer"
ADD COLUMN "assignmentType" "BranchTrainerAssignmentType" NOT NULL DEFAULT 'BRANCH_ONLY',
ADD COLUMN "courseId" TEXT,
ADD COLUMN "batchId" TEXT,
ADD COLUMN "mode" "CourseMode",
ADD COLUMN "batchTimingId" TEXT;

UPDATE "BranchTrainer" SET "assignmentType" = 'BRANCH_ONLY';

DROP INDEX IF EXISTS "BranchTrainer_branchId_trainerId_key";

CREATE INDEX "BranchTrainer_courseId_idx" ON "BranchTrainer"("courseId");
CREATE INDEX "BranchTrainer_batchId_idx" ON "BranchTrainer"("batchId");
CREATE INDEX "BranchTrainer_batchTimingId_idx" ON "BranchTrainer"("batchTimingId");
CREATE INDEX "BranchTrainer_branchId_assignmentType_idx" ON "BranchTrainer"("branchId", "assignmentType");

CREATE UNIQUE INDEX "BranchTrainer_branch_only_unique"
ON "BranchTrainer" ("branchId", "trainerId")
WHERE "assignmentType" = 'BRANCH_ONLY';

CREATE UNIQUE INDEX "BranchTrainer_course_batch_unique"
ON "BranchTrainer" (
  "branchId",
  "trainerId",
  "courseId",
  "batchId",
  "mode",
  "batchTimingId"
)
WHERE "assignmentType" = 'COURSE_BATCH';

ALTER TABLE "BranchTrainer" ADD CONSTRAINT "BranchTrainer_courseId_fkey"
FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BranchTrainer" ADD CONSTRAINT "BranchTrainer_batchId_fkey"
FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BranchTrainer" ADD CONSTRAINT "BranchTrainer_batchTimingId_fkey"
FOREIGN KEY ("batchTimingId") REFERENCES "BatchTiming"("id") ON DELETE CASCADE ON UPDATE CASCADE;
