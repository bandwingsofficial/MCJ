-- Add multi-media gallery support for community posts.

ALTER TABLE "CommunityPost"
ADD COLUMN "primaryMediaFileId" TEXT;

ALTER TABLE "CommunityPost"
ADD CONSTRAINT "CommunityPost_primaryMediaFileId_fkey"
FOREIGN KEY ("primaryMediaFileId") REFERENCES "Upload"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "CommunityPostMedia" (
  "id" TEXT NOT NULL,
  "postId" TEXT NOT NULL,
  "fileId" TEXT NOT NULL,
  "mediaType" "CommunityPostType" NOT NULL,
  "displayOrder" INTEGER,
  "isPrimary" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "CommunityPostMedia_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CommunityPostMedia_postId_fileId_key"
ON "CommunityPostMedia"("postId", "fileId");

CREATE INDEX "CommunityPostMedia_postId_idx"
ON "CommunityPostMedia"("postId");

CREATE INDEX "CommunityPostMedia_fileId_idx"
ON "CommunityPostMedia"("fileId");

CREATE INDEX "CommunityPostMedia_postId_isPrimary_idx"
ON "CommunityPostMedia"("postId", "isPrimary");

ALTER TABLE "CommunityPostMedia"
ADD CONSTRAINT "CommunityPostMedia_postId_fkey"
FOREIGN KEY ("postId") REFERENCES "CommunityPost"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CommunityPostMedia"
ADD CONSTRAINT "CommunityPostMedia_fileId_fkey"
FOREIGN KEY ("fileId") REFERENCES "Upload"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- Migrate existing single-media posts into the gallery table.
INSERT INTO "CommunityPostMedia" (
  "id",
  "postId",
  "fileId",
  "mediaType",
  "displayOrder",
  "isPrimary",
  "createdAt",
  "updatedAt"
)
SELECT
  gen_random_uuid()::text,
  cp."id",
  cp."mediaFileId",
  cp."type",
  0,
  CASE WHEN cp."type" = 'IMAGE' THEN true ELSE false END,
  cp."createdAt",
  cp."updatedAt"
FROM "CommunityPost" cp
WHERE cp."mediaFileId" IS NOT NULL;

UPDATE "CommunityPost" cp
SET "primaryMediaFileId" = cp."mediaFileId"
WHERE cp."mediaFileId" IS NOT NULL
  AND cp."type" = 'IMAGE';
