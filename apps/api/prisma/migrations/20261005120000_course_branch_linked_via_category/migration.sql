-- Track category-derived branch course links separately from batch and manual assigns.
ALTER TABLE "CourseBranch"
ADD COLUMN IF NOT EXISTS "linkedViaCategory" BOOLEAN NOT NULL DEFAULT false;
