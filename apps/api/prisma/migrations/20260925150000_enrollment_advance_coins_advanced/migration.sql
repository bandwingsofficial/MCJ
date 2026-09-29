-- ADVANCED lifecycle enum values (must be committed before use in follow-up migration).

ALTER TYPE "StudentStatus" ADD VALUE IF NOT EXISTS 'ADVANCED';

ALTER TYPE "EnrollmentStatus" ADD VALUE IF NOT EXISTS 'ADVANCED';
