-- AlterTable
ALTER TABLE "CommunityPost" ADD COLUMN IF NOT EXISTS "authorName" TEXT NOT NULL DEFAULT 'MCJ Community';
