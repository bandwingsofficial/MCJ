-- CreateTable
CREATE TABLE "CommunityPostView" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityPostView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityPostShare" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityPostShare_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CommunityPostView_postId_idx" ON "CommunityPostView"("postId");

-- CreateIndex
CREATE INDEX "CommunityPostView_userId_idx" ON "CommunityPostView"("userId");

-- CreateIndex
CREATE INDEX "CommunityPostView_postId_userId_idx" ON "CommunityPostView"("postId", "userId");

-- CreateIndex
CREATE INDEX "CommunityPostView_createdAt_idx" ON "CommunityPostView"("createdAt");

-- CreateIndex
CREATE INDEX "CommunityPostShare_postId_idx" ON "CommunityPostShare"("postId");

-- CreateIndex
CREATE INDEX "CommunityPostShare_userId_idx" ON "CommunityPostShare"("userId");

-- CreateIndex
CREATE INDEX "CommunityPostShare_postId_createdAt_idx" ON "CommunityPostShare"("postId", "createdAt");

-- AddForeignKey
ALTER TABLE "CommunityPostView" ADD CONSTRAINT "CommunityPostView_postId_fkey" FOREIGN KEY ("postId") REFERENCES "CommunityPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityPostView" ADD CONSTRAINT "CommunityPostView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityPostShare" ADD CONSTRAINT "CommunityPostShare_postId_fkey" FOREIGN KEY ("postId") REFERENCES "CommunityPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityPostShare" ADD CONSTRAINT "CommunityPostShare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Keep aggregate view counts at least as large as share counts.
UPDATE "CommunityPost"
SET "viewCount" = "shareCount"
WHERE "shareCount" > "viewCount";
