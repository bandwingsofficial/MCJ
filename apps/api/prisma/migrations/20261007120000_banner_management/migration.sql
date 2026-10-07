-- CreateEnum
CREATE TYPE "BannerPlacement" AS ENUM ('HOMEPAGE');

-- CreateEnum
CREATE TYPE "BannerLifecycleStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "Banner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "BannerPlacement" NOT NULL,
    "status" "BannerLifecycleStatus" NOT NULL DEFAULT 'ACTIVE',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Banner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BannerImage" (
    "id" TEXT NOT NULL,
    "bannerId" TEXT NOT NULL,
    "uploadId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "objectKey" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BannerImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Banner_name_idx" ON "Banner"("name");

-- CreateIndex
CREATE INDEX "Banner_type_idx" ON "Banner"("type");

-- CreateIndex
CREATE INDEX "Banner_status_idx" ON "Banner"("status");

-- CreateIndex
CREATE INDEX "Banner_displayOrder_idx" ON "Banner"("displayOrder");

-- CreateIndex
CREATE INDEX "Banner_createdAt_idx" ON "Banner"("createdAt");

-- CreateIndex
CREATE INDEX "BannerImage_bannerId_idx" ON "BannerImage"("bannerId");

-- CreateIndex
CREATE INDEX "BannerImage_uploadId_idx" ON "BannerImage"("uploadId");

-- CreateIndex
CREATE INDEX "BannerImage_bannerId_displayOrder_idx" ON "BannerImage"("bannerId", "displayOrder");

-- CreateIndex
CREATE INDEX "BannerImage_bannerId_isPrimary_idx" ON "BannerImage"("bannerId", "isPrimary");

-- AddForeignKey
ALTER TABLE "BannerImage" ADD CONSTRAINT "BannerImage_bannerId_fkey" FOREIGN KEY ("bannerId") REFERENCES "Banner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BannerImage" ADD CONSTRAINT "BannerImage_uploadId_fkey" FOREIGN KEY ("uploadId") REFERENCES "Upload"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
