-- Add enrollment approval workflow statuses and rejection reason.
ALTER TYPE "EnrollmentStatus" ADD VALUE IF NOT EXISTS 'PENDING_APPROVAL';
ALTER TYPE "EnrollmentStatus" ADD VALUE IF NOT EXISTS 'REJECTED';

ALTER TABLE "Enrollment" ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT;
