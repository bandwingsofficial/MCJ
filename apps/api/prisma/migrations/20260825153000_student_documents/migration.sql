-- CreateEnum
CREATE TYPE "StudentDocumentType" AS ENUM ('MARKS_CARD', 'AADHAAR', 'ID_PROOF', 'CERTIFICATE', 'PHOTO', 'OTHER');

-- CreateTable
CREATE TABLE "StudentDocument" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "StudentDocumentType" NOT NULL,
    "description" TEXT,
    "fileId" TEXT NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudentDocument_studentId_idx" ON "StudentDocument"("studentId");

-- CreateIndex
CREATE INDEX "StudentDocument_fileId_idx" ON "StudentDocument"("fileId");

-- CreateIndex
CREATE INDEX "StudentDocument_createdAt_idx" ON "StudentDocument"("createdAt");

-- AddForeignKey
ALTER TABLE "StudentDocument" ADD CONSTRAINT "StudentDocument_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentDocument" ADD CONSTRAINT "StudentDocument_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "Upload"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
