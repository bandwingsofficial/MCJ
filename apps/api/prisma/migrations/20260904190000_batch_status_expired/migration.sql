-- Add EXPIRED to BatchStatus for calculated lifecycle responses/filters.
-- Stored rows may still use COMPLETED historically; list filtering for
-- Upcoming/Ongoing/Expired uses date+time calculation, not this column alone.

ALTER TYPE "BatchStatus" ADD VALUE IF NOT EXISTS 'EXPIRED';
