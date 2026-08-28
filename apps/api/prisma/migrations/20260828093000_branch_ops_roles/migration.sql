-- AlterEnum
ALTER TYPE "BranchUserRole" ADD VALUE IF NOT EXISTS 'FACULTY';
ALTER TYPE "BranchUserRole" ADD VALUE IF NOT EXISTS 'INTERVIEWER';

-- AlterEnum
ALTER TYPE "Permission" ADD VALUE IF NOT EXISTS 'BATCH_READ';
ALTER TYPE "Permission" ADD VALUE IF NOT EXISTS 'ATTENDANCE_READ';
ALTER TYPE "Permission" ADD VALUE IF NOT EXISTS 'ATTENDANCE_WRITE';
ALTER TYPE "Permission" ADD VALUE IF NOT EXISTS 'ASSESSMENT_READ';
ALTER TYPE "Permission" ADD VALUE IF NOT EXISTS 'ASSESSMENT_WRITE';
ALTER TYPE "Permission" ADD VALUE IF NOT EXISTS 'JOB_APPLICATION_READ';
ALTER TYPE "Permission" ADD VALUE IF NOT EXISTS 'JOB_APPLICATION_UPDATE';
ALTER TYPE "Permission" ADD VALUE IF NOT EXISTS 'INTERVIEW_READ';
ALTER TYPE "Permission" ADD VALUE IF NOT EXISTS 'INTERVIEW_WRITE';
ALTER TYPE "Permission" ADD VALUE IF NOT EXISTS 'PLACEMENT_READ';

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'LEAVE');

-- CreateEnum
CREATE TYPE "AssessmentType" AS ENUM ('TEST', 'PRESENTATION', 'ASSIGNMENT', 'PRACTICAL', 'OTHER');

-- CreateEnum
CREATE TYPE "InterviewStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "InterviewMode" AS ENUM ('ONLINE', 'OFFLINE', 'PHONE');

-- CreateTable
CREATE TABLE "BatchFaculty" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "branchUserId" TEXT NOT NULL,
    "assignedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BatchFaculty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "status" "AttendanceStatus" NOT NULL,
    "punchIn" TIMESTAMP(3),
    "punchOut" TIMESTAMP(3),
    "durationMinutes" INTEGER,
    "remarks" TEXT,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicAssessment" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "type" "AssessmentType" NOT NULL,
    "name" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "maxMarks" DECIMAL(8,2) NOT NULL,
    "obtainedMarks" DECIMAL(8,2) NOT NULL,
    "remarks" TEXT,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Interview" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "interviewerId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 60,
    "mode" "InterviewMode" NOT NULL,
    "locationOrLink" TEXT,
    "notes" TEXT,
    "evaluation" TEXT,
    "status" "InterviewStatus" NOT NULL DEFAULT 'SCHEDULED',
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Interview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BranchActivityLog" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BranchActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BatchFaculty_batchId_branchUserId_key" ON "BatchFaculty"("batchId", "branchUserId");
CREATE INDEX "BatchFaculty_batchId_idx" ON "BatchFaculty"("batchId");
CREATE INDEX "BatchFaculty_branchUserId_idx" ON "BatchFaculty"("branchUserId");

CREATE UNIQUE INDEX "Attendance_studentId_batchId_date_key" ON "Attendance"("studentId", "batchId", "date");
CREATE INDEX "Attendance_branchId_idx" ON "Attendance"("branchId");
CREATE INDEX "Attendance_batchId_idx" ON "Attendance"("batchId");
CREATE INDEX "Attendance_studentId_idx" ON "Attendance"("studentId");
CREATE INDEX "Attendance_facultyId_idx" ON "Attendance"("facultyId");
CREATE INDEX "Attendance_date_idx" ON "Attendance"("date");
CREATE INDEX "Attendance_status_idx" ON "Attendance"("status");
CREATE INDEX "Attendance_branchId_date_idx" ON "Attendance"("branchId", "date");
CREATE INDEX "Attendance_batchId_date_idx" ON "Attendance"("batchId", "date");

CREATE INDEX "AcademicAssessment_branchId_idx" ON "AcademicAssessment"("branchId");
CREATE INDEX "AcademicAssessment_batchId_idx" ON "AcademicAssessment"("batchId");
CREATE INDEX "AcademicAssessment_studentId_idx" ON "AcademicAssessment"("studentId");
CREATE INDEX "AcademicAssessment_facultyId_idx" ON "AcademicAssessment"("facultyId");
CREATE INDEX "AcademicAssessment_type_idx" ON "AcademicAssessment"("type");
CREATE INDEX "AcademicAssessment_date_idx" ON "AcademicAssessment"("date");
CREATE INDEX "AcademicAssessment_branchId_date_idx" ON "AcademicAssessment"("branchId", "date");

CREATE INDEX "Interview_applicationId_idx" ON "Interview"("applicationId");
CREATE INDEX "Interview_jobId_idx" ON "Interview"("jobId");
CREATE INDEX "Interview_interviewerId_idx" ON "Interview"("interviewerId");
CREATE INDEX "Interview_branchId_idx" ON "Interview"("branchId");
CREATE INDEX "Interview_scheduledAt_idx" ON "Interview"("scheduledAt");
CREATE INDEX "Interview_status_idx" ON "Interview"("status");
CREATE INDEX "Interview_interviewerId_scheduledAt_idx" ON "Interview"("interviewerId", "scheduledAt");

CREATE INDEX "BranchActivityLog_branchId_idx" ON "BranchActivityLog"("branchId");
CREATE INDEX "BranchActivityLog_actorId_idx" ON "BranchActivityLog"("actorId");
CREATE INDEX "BranchActivityLog_resourceType_resourceId_idx" ON "BranchActivityLog"("resourceType", "resourceId");
CREATE INDEX "BranchActivityLog_createdAt_idx" ON "BranchActivityLog"("createdAt");

-- AddForeignKey
ALTER TABLE "BatchFaculty" ADD CONSTRAINT "BatchFaculty_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BatchFaculty" ADD CONSTRAINT "BatchFaculty_branchUserId_fkey" FOREIGN KEY ("branchUserId") REFERENCES "BranchUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "BranchUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AcademicAssessment" ADD CONSTRAINT "AcademicAssessment_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AcademicAssessment" ADD CONSTRAINT "AcademicAssessment_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AcademicAssessment" ADD CONSTRAINT "AcademicAssessment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AcademicAssessment" ADD CONSTRAINT "AcademicAssessment_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "BranchUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Interview" ADD CONSTRAINT "Interview_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "JobApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_interviewerId_fkey" FOREIGN KEY ("interviewerId") REFERENCES "BranchUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "BranchActivityLog" ADD CONSTRAINT "BranchActivityLog_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BranchActivityLog" ADD CONSTRAINT "BranchActivityLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "BranchUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
