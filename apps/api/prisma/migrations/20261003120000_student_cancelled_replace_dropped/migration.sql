-- Student lifecycle: add CANCELLED in its own migration.
-- DROPPED -> CANCELLED is the next migration so PostgreSQL commits the
-- new enum value before it is used (55P04).

ALTER TYPE "StudentStatus" ADD VALUE IF NOT EXISTS 'CANCELLED';
