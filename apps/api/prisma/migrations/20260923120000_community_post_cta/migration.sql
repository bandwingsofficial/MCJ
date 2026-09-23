-- AlterTable
ALTER TABLE "CommunityPost" ADD COLUMN "ctaEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "CommunityPost" ADD COLUMN "ctaLabel" TEXT;
ALTER TABLE "CommunityPost" ADD COLUMN "ctaUrl" TEXT;
