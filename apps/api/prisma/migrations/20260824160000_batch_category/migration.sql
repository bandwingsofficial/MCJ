-- AlterTable
ALTER TABLE "Batch" ADD COLUMN "categoryId" TEXT;

-- CreateIndex
CREATE INDEX "Batch_categoryId_idx" ON "Batch"("categoryId");

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
