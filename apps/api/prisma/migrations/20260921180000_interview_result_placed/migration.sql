-- Add PLACED as a final interview result.

ALTER TYPE "InterviewResult" ADD VALUE IF NOT EXISTS 'PLACED';
