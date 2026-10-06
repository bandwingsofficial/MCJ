-- Community post view/share tracking (idempotent for db push drift).

CREATE TABLE IF NOT EXISTS "CommunityPostView" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityPostView_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "CommunityPostShare" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityPostShare_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "CommunityPostView_postId_idx" ON "CommunityPostView"("postId");
CREATE INDEX IF NOT EXISTS "CommunityPostView_userId_idx" ON "CommunityPostView"("userId");
CREATE INDEX IF NOT EXISTS "CommunityPostView_postId_userId_idx" ON "CommunityPostView"("postId", "userId");
CREATE INDEX IF NOT EXISTS "CommunityPostView_createdAt_idx" ON "CommunityPostView"("createdAt");

CREATE INDEX IF NOT EXISTS "CommunityPostShare_postId_idx" ON "CommunityPostShare"("postId");
CREATE INDEX IF NOT EXISTS "CommunityPostShare_userId_idx" ON "CommunityPostShare"("userId");
CREATE INDEX IF NOT EXISTS "CommunityPostShare_postId_createdAt_idx" ON "CommunityPostShare"("postId", "createdAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'CommunityPostView_postId_fkey'
  ) THEN
    ALTER TABLE "CommunityPostView" ADD CONSTRAINT "CommunityPostView_postId_fkey"
      FOREIGN KEY ("postId") REFERENCES "CommunityPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'CommunityPostView_userId_fkey'
  ) THEN
    ALTER TABLE "CommunityPostView" ADD CONSTRAINT "CommunityPostView_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'CommunityPostShare_postId_fkey'
  ) THEN
    ALTER TABLE "CommunityPostShare" ADD CONSTRAINT "CommunityPostShare_postId_fkey"
      FOREIGN KEY ("postId") REFERENCES "CommunityPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'CommunityPostShare_userId_fkey'
  ) THEN
    ALTER TABLE "CommunityPostShare" ADD CONSTRAINT "CommunityPostShare_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

UPDATE "CommunityPost"
SET "viewCount" = "shareCount"
WHERE "shareCount" > "viewCount";
