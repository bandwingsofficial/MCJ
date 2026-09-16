-- AlterTable
ALTER TABLE "Branch" ADD COLUMN "thumbnailFileId" TEXT;
ALTER TABLE "Branch" ADD COLUMN "thumbnailUrl" TEXT;

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_thumbnailFileId_fkey" FOREIGN KEY ("thumbnailFileId") REFERENCES "Upload"("id") ON DELETE SET NULL ON UPDATE CASCADE;
