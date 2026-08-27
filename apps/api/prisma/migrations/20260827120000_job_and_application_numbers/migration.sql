-- AlterTable
ALTER TABLE "Job" ADD COLUMN "jobNumber" TEXT;

UPDATE "Job" AS job
SET "jobNumber" = numbered."jobNumber"
FROM (
  SELECT
    id,
    'JOB-' || EXTRACT(YEAR FROM "createdAt")::int::text || '-' ||
      LPAD((ROW_NUMBER() OVER (
        PARTITION BY EXTRACT(YEAR FROM "createdAt")
        ORDER BY "createdAt" ASC
      ))::text, 5, '0') AS "jobNumber"
  FROM "Job"
) AS numbered
WHERE job.id = numbered.id;

ALTER TABLE "Job" ALTER COLUMN "jobNumber" SET NOT NULL;

CREATE UNIQUE INDEX "Job_jobNumber_key" ON "Job"("jobNumber");
CREATE INDEX "Job_jobNumber_idx" ON "Job"("jobNumber");

-- AlterTable
ALTER TABLE "JobApplication" ADD COLUMN "applicationNumber" TEXT;
ALTER TABLE "JobApplication" ADD COLUMN "applicantName" TEXT;
ALTER TABLE "JobApplication" ADD COLUMN "applicantEmail" TEXT;
ALTER TABLE "JobApplication" ADD COLUMN "applicantPhone" TEXT;
ALTER TABLE "JobApplication" ADD COLUMN "highestQualification" TEXT;
ALTER TABLE "JobApplication" ADD COLUMN "yearsOfExperience" INTEGER;
ALTER TABLE "JobApplication" ALTER COLUMN "studentId" DROP NOT NULL;

UPDATE "JobApplication" AS application
SET "applicationNumber" = numbered."applicationNumber"
FROM (
  SELECT
    id,
    'APP-' || EXTRACT(YEAR FROM "createdAt")::int::text || '-' ||
      LPAD((ROW_NUMBER() OVER (
        PARTITION BY EXTRACT(YEAR FROM "createdAt")
        ORDER BY "createdAt" ASC
      ))::text, 6, '0') AS "applicationNumber"
  FROM "JobApplication"
) AS numbered
WHERE application.id = numbered.id;

ALTER TABLE "JobApplication" ALTER COLUMN "applicationNumber" SET NOT NULL;

CREATE UNIQUE INDEX "JobApplication_applicationNumber_key" ON "JobApplication"("applicationNumber");
CREATE INDEX "JobApplication_applicationNumber_idx" ON "JobApplication"("applicationNumber");
CREATE INDEX "JobApplication_applicantEmail_idx" ON "JobApplication"("applicantEmail");
