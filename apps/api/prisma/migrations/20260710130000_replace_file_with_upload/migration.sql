-- DropFileTableAndMigrateToUpload

CREATE TYPE "UploadStatus" AS ENUM ('ACTIVE', 'DELETED');
CREATE TYPE "UploadProvider" AS ENUM ('AWS_S3');
CREATE TYPE "UploadVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

CREATE TABLE "Upload" (
    "id" TEXT NOT NULL,
    "bucket" TEXT NOT NULL,
    "objectKey" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "extension" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "storedName" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "etag" TEXT,
    "checksum" TEXT,
    "folder" TEXT NOT NULL,
    "provider" "UploadProvider" NOT NULL DEFAULT 'AWS_S3',
    "visibility" "UploadVisibility" NOT NULL DEFAULT 'PUBLIC',
    "metadata" JSONB,
    "width" INTEGER,
    "height" INTEGER,
    "status" "UploadStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Upload_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Upload_objectKey_key" ON "Upload"("objectKey");
CREATE INDEX "Upload_storedName_idx" ON "Upload"("storedName");
CREATE INDEX "Upload_mimeType_idx" ON "Upload"("mimeType");
CREATE INDEX "Upload_provider_idx" ON "Upload"("provider");
CREATE INDEX "Upload_visibility_idx" ON "Upload"("visibility");
CREATE INDEX "Upload_folder_idx" ON "Upload"("folder");
CREATE INDEX "Upload_status_idx" ON "Upload"("status");
CREATE INDEX "Upload_createdBy_idx" ON "Upload"("createdBy");
CREATE INDEX "Upload_deletedAt_idx" ON "Upload"("deletedAt");
CREATE INDEX "Upload_createdAt_idx" ON "Upload"("createdAt");

-- Drop old File foreign keys
ALTER TABLE "Category" DROP CONSTRAINT IF EXISTS "Category_thumbnailFileId_fkey";
ALTER TABLE "Course" DROP CONSTRAINT IF EXISTS "Course_thumbnailFileId_fkey";
ALTER TABLE "CourseImage" DROP CONSTRAINT IF EXISTS "CourseImage_fileId_fkey";
ALTER TABLE "CourseMaterial" DROP CONSTRAINT IF EXISTS "CourseMaterial_fileId_fkey";
ALTER TABLE "Trainer" DROP CONSTRAINT IF EXISTS "Trainer_profileImageFileId_fkey";
ALTER TABLE "Student" DROP CONSTRAINT IF EXISTS "Student_profileImageFileId_fkey";
ALTER TABLE "JobApplication" DROP CONSTRAINT IF EXISTS "JobApplication_resumeFileId_fkey";
ALTER TABLE "FinancialArticle" DROP CONSTRAINT IF EXISTS "FinancialArticle_thumbnailFileId_fkey";
ALTER TABLE "FinancialArticle" DROP CONSTRAINT IF EXISTS "FinancialArticle_bannerFileId_fkey";
ALTER TABLE "CommunityPost" DROP CONSTRAINT IF EXISTS "CommunityPost_mediaFileId_fkey";

-- Drop File table and enums
DROP TABLE IF EXISTS "File";
DROP TYPE IF EXISTS "FileProvider";
DROP TYPE IF EXISTS "FileVisibility";

-- Add Upload foreign keys
ALTER TABLE "Category" ADD CONSTRAINT "Category_thumbnailFileId_fkey" FOREIGN KEY ("thumbnailFileId") REFERENCES "Upload"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Course" ADD CONSTRAINT "Course_thumbnailFileId_fkey" FOREIGN KEY ("thumbnailFileId") REFERENCES "Upload"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CourseImage" ADD CONSTRAINT "CourseImage_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "Upload"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CourseMaterial" ADD CONSTRAINT "CourseMaterial_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "Upload"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Trainer" ADD CONSTRAINT "Trainer_profileImageFileId_fkey" FOREIGN KEY ("profileImageFileId") REFERENCES "Upload"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Student" ADD CONSTRAINT "Student_profileImageFileId_fkey" FOREIGN KEY ("profileImageFileId") REFERENCES "Upload"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_resumeFileId_fkey" FOREIGN KEY ("resumeFileId") REFERENCES "Upload"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "FinancialArticle" ADD CONSTRAINT "FinancialArticle_thumbnailFileId_fkey" FOREIGN KEY ("thumbnailFileId") REFERENCES "Upload"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "FinancialArticle" ADD CONSTRAINT "FinancialArticle_bannerFileId_fkey" FOREIGN KEY ("bannerFileId") REFERENCES "Upload"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CommunityPost" ADD CONSTRAINT "CommunityPost_mediaFileId_fkey" FOREIGN KEY ("mediaFileId") REFERENCES "Upload"("id") ON DELETE SET NULL ON UPDATE CASCADE;
